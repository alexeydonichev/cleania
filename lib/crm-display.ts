export function matchesCrmSearch(value: string, query: string): boolean {
  const normalize = (s: string) => s.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").trim();
  if (normalize(value).includes(normalize(query))) return true;
  if (!/^[+\d\s().-]+$/.test(query.trim())) return false;
  const digits = query.replace(/\D/g, "");
  if (digits.length < 3) return false;
  const normalizePhone = (s: string) => s.length === 11 && s.startsWith("8") ? `7${s.slice(1)}` : s;
  return (value.match(/\+?\d[\d\s().-]{2,}\d/g) || []).some(phone => normalizePhone(phone.replace(/\D/g, "")).includes(normalizePhone(digits)));
}

export function unfinished(status: string): boolean {
  return status !== "completed" && status !== "cancelled";
}

export function overdueOrder(order: {status: string; preferred_date: string | null}, today: string): boolean {
  return unfinished(order.status) && !!order.preferred_date && order.preferred_date < today;
}
