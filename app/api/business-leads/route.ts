import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";
import { dispatchLeadNotifications } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const rateLimit = await checkRateLimit(request, "business-leads", 4);
    if (!rateLimit.allowed)
      return NextResponse.json(
        { error: "Слишком много заявок. Попробуйте немного позже." },
        { status: 429, headers: { "retry-after": String(rateLimit.retryAfter) } },
      );
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name || "")
      .trim()
      .slice(0, 100);
    const phone = String(body.phone || "")
      .trim()
      .slice(0, 40);
    const objectType = String(body.objectType || "")
      .trim()
      .slice(0, 80);
    const schedule = String(body.schedule || "")
      .trim()
      .slice(0, 80);
    const area = Number(body.area);
    const comment = String(body.comment || "")
      .trim()
      .slice(0, 800);
    if (
      !name ||
      phone.replace(/\D/g, "").length < 10 ||
      !objectType ||
      !schedule ||
      !Number.isFinite(area) ||
      area < 20 ||
      body.consent !== "on"
    )
      return NextResponse.json(
        { error: "Проверьте обязательные поля" },
        { status: 400 },
      );
    const db = rawDb();
    const now = new Date().toISOString();
    const leadId = crypto.randomUUID();
    const notes = `${objectType}, ${area} м², ${schedule}${comment ? `. ${comment}` : ""}`;
    await db.batch([
      db
        .prepare(
          `INSERT INTO leads (id, name, phone, source, city, status, notes, consent_at, created_at, updated_at) VALUES (?, ?, ?, 'business_page', 'Новосибирск', 'new', ?, ?, ?, ?)`,
        )
        .bind(leadId, name, phone, notes, now, now, now),
      db
        .prepare(
          `INSERT INTO activities (id, lead_id, type, body, created_at) VALUES (?, ?, 'business_lead_created', ?, ?)`,
        )
        .bind(crypto.randomUUID(), leadId, `B2B-заявка: ${notes}`, now),
    ]);
    await dispatchLeadNotifications(
      "Новая B2B-заявка Cleania",
      `Новая B2B-заявка Cleania\n${name} · ${phone}\n${notes}`,
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("business_lead_create_failed", error);
    return NextResponse.json(
      { error: "Сервис временно недоступен" },
      { status: 500 },
    );
  }
}
