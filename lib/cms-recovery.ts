export type CmsRecovery = { id: string; version: number; savedAt: string; content: Record<string, unknown> };
export function recoveryKey(owner: string, id: string) { return `bleskpro:cms-recovery:${encodeURIComponent(owner)}:${encodeURIComponent(id)}`; }
export function readRecovery(raw: string | null, id: string): CmsRecovery | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as CmsRecovery;
    if (value.id !== id || !Number.isSafeInteger(value.version) || typeof value.savedAt !== "string" || !Number.isFinite(Date.parse(value.savedAt))
      || !value.content || typeof value.content !== "object" || Array.isArray(value.content)) return null;
    if (Date.now() - Date.parse(value.savedAt) > 30 * 86400000) return null;
    if (id.startsWith("article:")) {
      const sections = value.content.sections;
      if (!Array.isArray(sections) || !sections.every(s => s && typeof s.heading === "string" && Array.isArray(s.paragraphs) && s.paragraphs.every((p:unknown) => typeof p === "string") && (!s.bullets || Array.isArray(s.bullets) && s.bullets.every((p:unknown) => typeof p === "string")))) return null;
    } else if (![value.content.includes,value.content.notIncluded].every(v => Array.isArray(v) && v.every(p => typeof p === "string"))) return null;
    return value;
  } catch { return null; }
}
