export type PricingUpdate = { key: string; rate: number; minimum: number; version: string };

export function validatePricingUpdates(input: unknown): PricingUpdate[] {
  if (!Array.isArray(input) || !input.length || input.length > 4) throw new Error("Проверьте тарифы");
  const seen = new Set<string>();
  return input.map(rule => {
    if (!rule || typeof rule !== "object" || !["regular", "deep", "renovation", "office"].includes(rule.key) || seen.has(rule.key)
      || !Number.isSafeInteger(rule.rate) || rule.rate < 1 || rule.rate > 100000
      || !Number.isSafeInteger(rule.minimum) || rule.minimum < 500 || rule.minimum > 10000000
      || typeof rule.version !== "string" || !rule.version || rule.version.length > 100) throw new Error("Проверьте тарифы и обновите их перед сохранением");
    seen.add(rule.key);
    return { key: rule.key, rate: rule.rate, minimum: rule.minimum, version: rule.version };
  });
}

// Compare all versions before changing any row, so stale requests cannot cause partial updates.
export function pricingUpdateStatement(rules: PricingUpdate[], revision: string) {
  return {
    sql: `WITH requested(key,rate,minimum,version) AS MATERIALIZED (VALUES ${rules.map(() => "(?,?,?,?)").join(",")}),
      guard(ok) AS MATERIALIZED (SELECT COUNT(*) = ? FROM pricing_rules p JOIN requested r ON p.key=r.key AND p.updated_at=r.version)
      UPDATE pricing_rules SET rate=(SELECT rate FROM requested WHERE key=pricing_rules.key),
      minimum=(SELECT minimum FROM requested WHERE key=pricing_rules.key), updated_at=?
      WHERE key IN (SELECT key FROM requested) AND (SELECT ok FROM guard)`,
    values: [...rules.flatMap(r => [r.key, r.rate, r.minimum, r.version]), rules.length, revision],
  };
}
