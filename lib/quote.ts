export const serviceKeys = ["regular", "deep", "renovation", "office"] as const;
export type ServiceKey = (typeof serviceKeys)[number];
export type ConditionKey = "normal" | "dirty" | "very_dirty";
export type FrequencyKey = "once" | "weekly" | "biweekly";
export type City = "Новосибирск" | "Бердск";
export type PricingRule = { label: string; rate: number; minimum: number };
export const defaultPricing: Record<ServiceKey, PricingRule> = {
  regular: { label: "Поддерживающая", rate: 95, minimum: 2490 },
  deep: { label: "Генеральная", rate: 160, minimum: 4490 },
  renovation: { label: "После ремонта", rate: 230, minimum: 6990 },
  office: { label: "Офис", rate: 110, minimum: 5990 },
};
export const extrasCatalog = {
  windows: { label: "Мойка окна", unit: "двустворчатое окно", price: 1200, max: 12 },
  oven: { label: "Духовка внутри", unit: "1 духовка", price: 650, max: 3 },
  fridge: { label: "Холодильник внутри", unit: "1 холодильник", price: 650, max: 3 },
  balcony: { label: "Уборка балкона", unit: "до 6 м², без остекления", price: 900, max: 3 },
  cabinets: { label: "Шкафы внутри", unit: "до 6 секций, пустые", price: 950, max: 3 },
  ironing: { label: "Глажка вещей", unit: "1 час", price: 700, max: 5 },
} as const;
export type ExtraKey = keyof typeof extrasCatalog;
export type QuoteInput = { service: ServiceKey; area: number; bathrooms: number; condition: ConditionKey; frequency: FrequencyKey; extras: ExtraKey[] };
export const money = (value: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
export function calculateQuote(input: QuoteInput, rule: PricingRule | { rate: number; minimum: number }) {
  const base = Math.max(rule.minimum, input.area * rule.rate);
  const bathrooms = Math.max(0, input.bathrooms - 1) * 550;
  const condition = Math.round((base + bathrooms) * (input.condition === "very_dirty" ? .35 : input.condition === "dirty" ? .18 : 0));
  const extras = input.extras.reduce((sum, key) => sum + extrasCatalog[key].price, 0);
  const subtotal = base + bathrooms + condition + extras;
  const discountRate = input.service === "regular" ? input.frequency === "weekly" ? .15 : input.frequency === "biweekly" ? .1 : 0 : 0;
  const discount = Math.round(subtotal * discountRate);
  const crew = input.area >= 80 || input.service === "renovation" ? 2 : 1;
  const productivity = input.service === "renovation" ? 10 : input.service === "deep" ? 12 : 20;
  const duration = Math.max(2, Math.ceil((input.area / productivity + input.extras.length * .5) / crew * 2) / 2);
  return { base, bathrooms, condition, extras, discount, total: subtotal - discount, duration, crew };
}
export function todayInNovosibirsk() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Novosibirsk", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function validPhone(phone: string) { return /^(?:7|8)\d{10}$/.test(phone.replace(/\D/g, "")); }
