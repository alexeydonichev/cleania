export const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type Attribution = Partial<Record<typeof attributionKeys[number], string>>;

// Deliberately exclude URLs, query strings, contact data and advertising click IDs.
export function sanitizeAttribution(value: unknown): Attribution {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Attribution = {};
  for (const key of attributionKeys) {
    const item = (value as Record<string, unknown>)[key];
    if (typeof item === "string" && /^[\p{L}\p{N}_.\- ]{1,100}$/u.test(item)) result[key] = item;
  }
  return result;
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const current = sanitizeAttribution(Object.fromEntries(new URLSearchParams(window.location.search)));
  try {
    if (Object.keys(current).length) sessionStorage.setItem("bleskpro-source", JSON.stringify(current));
    return Object.keys(current).length ? current : sanitizeAttribution(JSON.parse(sessionStorage.getItem("bleskpro-source") || "{}"));
  } catch { return current; }
}

export function attributionNote(value: unknown) {
  const clean = sanitizeAttribution(value);
  return Object.keys(clean).length ? `Источник обращения: ${JSON.stringify(clean)}` : "";
}
