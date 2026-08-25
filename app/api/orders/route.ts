import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";
import { dispatchOrderNotifications } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

type ServiceKey = "regular" | "deep" | "renovation" | "office";
type ConditionKey = "normal" | "dirty" | "very_dirty";
type FrequencyKey = "once" | "weekly" | "biweekly";

const serviceRules: Record<ServiceKey, { rate: number; minimum: number }> = {
  regular: { rate: 95, minimum: 2490 },
  deep: { rate: 160, minimum: 4490 },
  renovation: { rate: 230, minimum: 6990 },
  office: { rate: 110, minimum: 5990 },
};

const extraPrices: Record<string, number> = {
  windows: 1200,
  oven: 650,
  fridge: 650,
  balcony: 900,
  cabinets: 950,
  ironing: 700,
};

function calculate(
  input: {
    service: ServiceKey;
    area: number;
    bathrooms: number;
    extras: string[];
    condition: ConditionKey;
    frequency: FrequencyKey;
  },
  rule: { rate: number; minimum: number },
) {
  const base = Math.max(rule.minimum, input.area * rule.rate);
  const bathrooms = Math.max(0, input.bathrooms - 1) * 550;
  const extras = input.extras.reduce(
    (sum, key) => sum + (extraPrices[key] || 0),
    0,
  );
  const condition =
    input.condition === "very_dirty"
      ? 1.35
      : input.condition === "dirty"
        ? 1.18
        : 1;
  const frequency =
    input.frequency === "weekly"
      ? 0.85
      : input.frequency === "biweekly"
        ? 0.9
        : 1;
  const total =
    Math.round((((base + bathrooms) * condition + extras) * frequency) / 50) *
    50;
  const duration = Math.max(
    2,
    Math.round(
      (input.area / (input.service === "renovation" ? 12 : 18) +
        input.extras.length * 0.35) *
        2,
    ) / 2,
  );
  return {
    total,
    duration,
    crew: input.area >= 80 || input.service === "renovation" ? 2 : 1,
  };
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
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
    const extras = Array.isArray(body.extras)
      ? body.extras.map(String).filter((item) => item in extraPrices)
      : [];
    const name = String(body.name || "")
      .trim()
      .slice(0, 100);
    const phone = String(body.phone || "")
      .trim()
      .slice(0, 40);
    const phoneDigits = phone.replace(/\D/g, "");
    const preferredDate = body.preferredDate
      ? String(body.preferredDate).slice(0, 10)
      : null;

    if (
      !(service in serviceRules) ||
      !["normal", "dirty", "very_dirty"].includes(condition) ||
      !["once", "weekly", "biweekly"].includes(frequency)
    ) {
      return NextResponse.json(
        { error: "Некорректные параметры расчёта" },
        { status: 400 },
      );
    }
    if (
      !Number.isFinite(area) ||
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
    if (!name || phoneDigits.length < 10 || body.consent !== true) {
      return NextResponse.json(
        { error: "Укажите имя, телефон и согласие на обработку данных" },
        { status: 400 },
      );
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
    const estimate = calculate(
      { service, area, bathrooms, extras, condition, frequency },
      storedRule || serviceRules[service],
    );

    await db.batch([
      db
        .prepare(
          `INSERT INTO leads (id, name, phone, source, city, status, consent_at, created_at, updated_at) VALUES (?, ?, ?, 'website', 'Новосибирск', 'new', ?, ?, ?)`,
        )
        .bind(leadId, name, phone, now, now, now),
      db
        .prepare(
          `INSERT INTO orders (id, order_number, lead_id, service_type, area, bathrooms, condition, frequency, extras_json, preferred_date, estimate_total, duration_hours, crew_size, status, payment_status, upload_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'unpaid', ?, ?, ?)`,
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
