export const orderStatuses = { new: "Новая", confirmed: "Подтверждена", scheduled: "Назначена", in_progress: "В работе", completed: "Завершена", cancelled: "Отменена" };
export const leadStatuses = { new: "Новое", contacted: "Связались", qualified: "Согласовываем", closed: "Закрыто" };
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Некорректные данные");
  return value as Record<string, unknown>;
}
export function textField(value: unknown, max: number, required = false) {
  if (typeof value !== "string") { if (!required && value == null) return ""; throw new Error("Проверьте текстовые поля"); }
  const text = value.trim();
  if (text.length > max || (required && !text)) throw new Error(`Заполните поле (до ${max} символов)`);
  return text;
}
export function numberField(value: unknown, min = 0, max = 10000000) {
  if (value === "" || value === null || typeof value === "boolean" || !["number", "string"].includes(typeof value)) throw new Error("Укажите число");
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Число должно быть от ${min} до ${max}`);
  return n;
}
export function dateField(value: unknown) {
  if (!value) return null;
  const date = textField(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error("Проверьте дату");
  return date;
}
export function enumField<T extends string>(value: unknown, options: readonly T[]): T {
  if (typeof value !== "string" || !options.includes(value as T)) throw new Error("Недопустимое значение");
  return value as T;
}
