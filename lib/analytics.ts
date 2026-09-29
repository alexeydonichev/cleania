export type Conversion = "calculator_start" | "calculator_complete" | "full_order_submit" | "callback_submit" | "business_submit" | "call_click" | "telegram_click" | "max_click";
declare global { interface Window { ym?: ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number }; } }
export function trackConversion(event: Conversion) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("bleskpro:conversion", { detail: { event } }));
  try {
    const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    if (id && /^\d+$/.test(id) && localStorage.getItem("bleskpro-analytics") === "yes") window.ym?.(Number(id), "reachGoal", event);
  } catch { /* Storage or analytics blocking must never break a booking. */ }
}
