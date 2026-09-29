import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";
import { dispatchLeadNotifications, hasConfiguredNotificationChannel } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";
import { validPhone } from "@/lib/quote";
import { attributionNote } from "@/lib/attribution";

export async function POST(request: Request) {
  try {
    if (!hasConfiguredNotificationChannel()) return NextResponse.json({ error: "Передайте просьбу о звонке в Telegram или MAX — сообщение уже подготовлено ниже." }, { status: 503 });
    await ensureDatabase();
    const limit = await checkRateLimit(request, "callback-requests", 4);
    if (!limit.allowed) return NextResponse.json({ error: "Слишком много обращений. Попробуйте позже." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });
    let body: Record<string, unknown>;
    try { const parsed = await request.json(); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(); body = parsed as Record<string, unknown>; } catch { return NextResponse.json({ error: "Проверьте данные заявки." }, { status: 400 }); }
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
    if (!name || !validPhone(phone) || body.consent !== true) return NextResponse.json({ error: "Укажите имя, российский номер телефона и согласие на обработку данных." }, { status: 400 });
    const id = crypto.randomUUID(); const now = new Date().toISOString();
    const notes = ["Запрос обратного звонка", attributionNote(body.attribution)].filter(Boolean).join("\n");
    const db = rawDb();
    await db.batch([
      db.prepare("INSERT INTO leads (id, name, phone, source, city, notes, status, consent_at, created_at, updated_at) VALUES (?, ?, ?, 'callback', 'Уточнить', ?, 'new', ?, ?, ?)").bind(id, name, phone, notes, now, now, now),
      db.prepare("INSERT INTO activities (id, lead_id, type, body, created_at) VALUES (?, ?, 'callback_requested', ?, ?)").bind(crypto.randomUUID(), id, "Запрошен обратный звонок с сайта", now),
    ]);
    await dispatchLeadNotifications("Обратный звонок БлескПРО", `${name} · ${phone}\n${notes}`);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "Не удалось подтвердить отправку. Свяжитесь с нами напрямую." }, { status: 500 }); }
}
