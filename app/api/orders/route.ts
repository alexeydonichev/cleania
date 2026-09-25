import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";
import { dispatchOrderNotifications, hasConfiguredNotificationChannel } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

import { calculateQuote, defaultPricing, extrasCatalog, serviceKeys, todayInNovosibirsk, validPhone, type ServiceKey, type ConditionKey, type FrequencyKey, type ExtraKey } from "@/lib/quote";

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    if (!hasConfiguredNotificationChannel())
      return NextResponse.json(
        { error: "Приём заявок временно настраивается. Напишите нам в Telegram или MAX — расчёт уже готов." },
        { status: 503, headers: { "retry-after": "300" } },
      );
    const rateLimit = await checkRateLimit(request, "orders", 6);
    if (!rateLimit.allowed)
      return NextResponse.json(
        { error: "Слишком много заявок. Попробуйте немного позже." },
        { status: 429, headers: { "retry-after": String(rateLimit.retryAfter) } },
      );
    const body = (await request.json()) as Record<string, unknown>;
    const service = String(body.service || "") as ServiceKey;
    const condition = String(body.condition || "") as ConditionKey;
    const frequency = String(body.frequency || "") as FrequencyKey;
    const area = Number(body.area);
    const bathrooms = Number(body.bathrooms);
    const extras = Array.isArray(body.extras) ? body.extras.map(String) as ExtraKey[] : [];
    const city = body.city === undefined ? "Новосибирск" : String(body.city);
    const address = String(body.address || "").trim().slice(0, 300);
    const comment = String(body.comment || "").trim().slice(0, 1000);
    const preferredSlot = body.preferredSlot ? String(body.preferredSlot) : null;
    if (!["Новосибирск", "Бердск"].includes(city) ||
      extras.some(key => !Object.hasOwn(extrasCatalog, key)) ||
      (Object.keys(extrasCatalog) as ExtraKey[]).some(key => extras.filter(item => item === key).length > extrasCatalog[key].max) ||
      (preferredSlot && !["09:00–12:00", "12:00–15:00", "15:00–18:00"].includes(preferredSlot))) {
      return NextResponse.json({ error: "Проверьте город, время и дополнительные услуги" }, { status: 400 });
    }
    const name = String(body.name || "")
      .trim()
      .slice(0, 100);
    const phone = String(body.phone || "")
      .trim()
      .slice(0, 40);

    const preferredDate = body.preferredDate
      ? String(body.preferredDate).slice(0, 10)
      : null;

    if (
      !serviceKeys.includes(service) ||
      !["normal", "dirty", "very_dirty"].includes(condition) ||
      !["once", "weekly", "biweekly"].includes(frequency)
    ) {
      return NextResponse.json(
        { error: "Некорректные параметры расчёта" },
        { status: 400 },
      );
    }
    if (
      !Number.isInteger(area) ||
      area < 20 ||
      area > 300 ||
      !Number.isInteger(bathrooms) ||
      bathrooms < 1 ||
      bathrooms > 4
    ) {
      return NextResponse.json(
        { error: "Проверьте площадь и количество санузлов" },
        { status: 400 },
      );
    }
    if (!name || !validPhone(phone) || body.consent !== true) {
      return NextResponse.json(
        { error: "Укажите имя, телефон и согласие на обработку данных" },
        { status: 400 },
      );
    }

    if (preferredDate && (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || Number.isNaN(Date.parse(preferredDate)) || new Date(preferredDate).toISOString().slice(0, 10) !== preferredDate || preferredDate < todayInNovosibirsk())) {
      return NextResponse.json({ error: "Выберите сегодняшнюю или будущую дату" }, { status: 400 });
    }
    if (service !== "regular" && frequency !== "once") {
      return NextResponse.json({ error: "Регулярность доступна для поддерживающей уборки" }, { status: 400 });
    }
    const db = rawDb();
    const now = new Date().toISOString();
    const leadId = crypto.randomUUID();
    const orderId = crypto.randomUUID();
    const uploadToken = crypto.randomUUID();
    const orderNumber = `CL-${now.slice(2, 10).replaceAll("-", "")}-${orderId.slice(0, 4).toUpperCase()}`;
    const storedRule = await db
      .prepare(
        "SELECT rate, minimum FROM pricing_rules WHERE key = ? AND active = 1",
      )
      .bind(service)
      .first<{ rate: number; minimum: number }>();
    const estimate = calculateQuote(
      { service, area, bathrooms, extras, condition, frequency },
      storedRule || defaultPricing[service],
    );

    if (body.expectedEstimate !== undefined && Number(body.expectedEstimate) !== estimate.total) {
      return NextResponse.json({ error: "Тариф обновился. Проверьте новую сумму и отправьте заявку повторно." }, { status: 409 });
    }
    await db.batch([
      db
        .prepare(
          `INSERT INTO leads (id, name, phone, source, city, notes, status, consent_at, created_at, updated_at) VALUES (?, ?, ?, 'website', ?, ?, 'new', ?, ?, ?)`,
        )
        .bind(leadId, name, phone, city, comment || null, now, now, now),
      db
        .prepare(
          `INSERT INTO orders (id, order_number, lead_id, service_type, area, bathrooms, condition, frequency, extras_json, preferred_date, preferred_slot, address, estimate_total, duration_hours, crew_size, status, payment_status, upload_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'unpaid', ?, ?, ?)`,
        )
        .bind(
          orderId,
          orderNumber,
          leadId,
          service,
          area,
          bathrooms,
          condition,
          frequency,
          JSON.stringify(extras),
          preferredDate,
          preferredSlot,
          address || null,
          estimate.total,
          estimate.duration,
          estimate.crew,
          uploadToken,
          now,
          now,
        ),
      db
        .prepare(
          `INSERT INTO activities (id, order_id, lead_id, type, body, created_at) VALUES (?, ?, ?, 'order_created', ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          orderId,
          leadId,
          `Новая заявка ${orderNumber} с сайта`,
          now,
        ),
      ...["telegram", "max", "email"].map((channel) =>
        db
          .prepare(
            `INSERT INTO integration_events (id, order_id, channel, status, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, ?)`,
          )
          .bind(crypto.randomUUID(), orderId, channel, now, now),
      ),
    ]);

    await dispatchOrderNotifications({
      orderId,
      orderNumber,
      name,
      phone,
      service,
      area,
      estimate: estimate.total,
      preferredDate,
      city,
      address,
      preferredSlot,
    });

    return NextResponse.json(
      { ok: true, orderNumber, estimate: estimate.total, uploadToken },
      { status: 201 },
    );
  } catch (error) {
    console.error("order_create_failed", error);
    return NextResponse.json(
      { error: "Сервис временно недоступен. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
