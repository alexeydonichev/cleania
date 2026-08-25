import { env } from "cloudflare:workers";
import { rawDb } from "@/db/runtime";

type OrderNotice = {
  orderId: string;
  orderNumber: string;
  name: string;
  phone: string;
  service: string;
  area: number;
  estimate: number;
  preferredDate: string | null;
};

type RuntimeEnv = typeof env & {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  MAX_BOT_TOKEN?: string;
  MAX_CHAT_ID?: string;
  EMAIL_WEBHOOK_URL?: string;
};

function noticeText(order: OrderNotice) {
  return [
    `Новая заявка Cleania ${order.orderNumber}`,
    `${order.name} · ${order.phone}`,
    `${order.service}, ${order.area} м²`,
    `Расчёт: ${new Intl.NumberFormat("ru-RU").format(order.estimate)} ₽`,
    order.preferredDate
      ? `Желаемая дата: ${order.preferredDate}`
      : "Дата: уточнить",
  ].join("\n");
}

async function mark(
  orderId: string,
  channel: string,
  status: string,
  error?: string,
) {
  const now = new Date().toISOString();
  await rawDb()
    .prepare(
      `UPDATE integration_events SET status = ?, attempts = attempts + 1, last_error = ?, updated_at = ? WHERE order_id = ? AND channel = ?`,
    )
    .bind(status, error?.slice(0, 500) || null, now, orderId, channel)
    .run();
}

async function telegram(order: OrderNotice, runtime: RuntimeEnv) {
  if (!runtime.TELEGRAM_BOT_TOKEN || !runtime.TELEGRAM_CHAT_ID)
    return mark(order.orderId, "telegram", "not_configured");
  const response = await fetch(
    `https://api.telegram.org/bot${runtime.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: runtime.TELEGRAM_CHAT_ID,
        text: noticeText(order),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!response.ok) throw new Error(`Telegram HTTP ${response.status}`);
  await mark(order.orderId, "telegram", "sent");
}

async function maxMessenger(order: OrderNotice, runtime: RuntimeEnv) {
  if (!runtime.MAX_BOT_TOKEN || !runtime.MAX_CHAT_ID)
    return mark(order.orderId, "max", "not_configured");
  const url = new URL("https://platform-api2.max.ru/messages");
  url.searchParams.set("chat_id", runtime.MAX_CHAT_ID);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: runtime.MAX_BOT_TOKEN,
      "content-type": "application/json",
    },
    body: JSON.stringify({ text: noticeText(order), notify: true }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`MAX HTTP ${response.status}`);
  await mark(order.orderId, "max", "sent");
}

async function emailWebhook(order: OrderNotice, runtime: RuntimeEnv) {
  if (!runtime.EMAIL_WEBHOOK_URL)
    return mark(order.orderId, "email", "not_configured");
  const response = await fetch(runtime.EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      subject: `Новая заявка ${order.orderNumber}`,
      text: noticeText(order),
      order,
    }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Email webhook HTTP ${response.status}`);
  await mark(order.orderId, "email", "sent");
}

export async function dispatchOrderNotifications(order: OrderNotice) {
  const runtime = env as RuntimeEnv;
  const deliveries = [
    ["telegram", () => telegram(order, runtime)],
    ["max", () => maxMessenger(order, runtime)],
    ["email", () => emailWebhook(order, runtime)],
  ] as const;
  await Promise.all(
    deliveries.map(async ([channel, deliver]) => {
      try {
        await deliver();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown delivery error";
        await mark(order.orderId, channel, "failed", message);
      }
    }),
  );
}

export async function dispatchLeadNotifications(subject: string, text: string) {
  const runtime = env as RuntimeEnv;
  const deliveries: Promise<Response>[] = [];
  if (runtime.TELEGRAM_BOT_TOKEN && runtime.TELEGRAM_CHAT_ID) {
    deliveries.push(
      fetch(`https://api.telegram.org/bot${runtime.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: runtime.TELEGRAM_CHAT_ID, text }),
        signal: AbortSignal.timeout(5000),
      }),
    );
  }
  if (runtime.MAX_BOT_TOKEN && runtime.MAX_CHAT_ID) {
    const url = new URL("https://platform-api2.max.ru/messages");
    url.searchParams.set("chat_id", runtime.MAX_CHAT_ID);
    deliveries.push(
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: runtime.MAX_BOT_TOKEN,
          "content-type": "application/json",
        },
        body: JSON.stringify({ text, notify: true }),
        signal: AbortSignal.timeout(5000),
      }),
    );
  }
  if (runtime.EMAIL_WEBHOOK_URL) {
    deliveries.push(
      fetch(runtime.EMAIL_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, text }),
        signal: AbortSignal.timeout(5000),
      }),
    );
  }
  await Promise.allSettled(deliveries);
}
