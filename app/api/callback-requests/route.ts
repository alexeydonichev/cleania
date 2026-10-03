import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";
import { dispatchLeadNotifications, hasConfiguredNotificationChannel, leadNotificationStatements } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";
import { validPhone } from "@/lib/quote";
import { attributionNote } from "@/lib/attribution";
import { readSubmission, existingSubmission, saveSubmission, SubmissionError } from "@/lib/public-submissions";

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const submission = await readSubmission(request, "callback");
    const existing = await existingSubmission(submission);
    if (existing) return NextResponse.json(existing);
    if (!hasConfiguredNotificationChannel()) return NextResponse.json({ error: "Передайте просьбу о звонке в Telegram или MAX — сообщение уже подготовлено ниже." }, { status: 503 });
    const limit = await checkRateLimit(request, "callback-requests", 4);
    if (!limit.allowed) return NextResponse.json({ error: "Слишком много обращений. Попробуйте позже." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });
    const { body } = submission;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
    if (!name || !validPhone(phone) || body.consent !== true) return NextResponse.json({ error: "Укажите имя, российский номер телефона и согласие на обработку данных." }, { status: 400 });
    const id = crypto.randomUUID(); const now = new Date().toISOString();
    const notes = ["Запрос обратного звонка", attributionNote(body.attribution)].filter(Boolean).join("\n");
    const db = rawDb();
    const saved = await saveSubmission(submission, { ok: true }, [
      db.prepare("INSERT INTO leads (id, name, phone, source, city, notes, status, consent_at, created_at, updated_at) VALUES (?, ?, ?, 'callback', 'Уточнить', ?, 'new', ?, ?, ?)").bind(id, name, phone, notes, now, now, now),
      db.prepare("INSERT INTO activities (id, lead_id, type, body, created_at) VALUES (?, ?, 'callback_requested', ?, ?)").bind(crypto.randomUUID(), id, "Запрошен обратный звонок с сайта", now),
      ...leadNotificationStatements(id, now),
    ]);
    if (saved.created) await dispatchLeadNotifications("Обратный звонок БлескПРО", `${name} · ${phone}\n${notes}`, id).catch(() => console.error("callback_notification_failed"));
    return NextResponse.json(saved.response, { status: saved.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof SubmissionError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("callback_save_failed");
    return NextResponse.json({ error: "Не удалось подтвердить отправку. Повторите отправку с теми же данными или свяжитесь с нами напрямую." }, { status: 500 });
  }
}
