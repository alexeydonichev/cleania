import test from "node:test";
import assert from "node:assert/strict";
import { calculateQuote, defaultPricing, serviceKeys, validPhone, todayInNovosibirsk } from "../lib/quote.ts";

const base = { service: "regular", area: 50, bathrooms: 1, extras: [], condition: "normal", frequency: "once" };
test("minimum is exact: the advertised 2490 does not silently become 2500", () => {
  assert.equal(calculateQuote({ ...base, area: 20 }, defaultPricing.regular).total, 2490);
  assert.equal(calculateQuote(base, defaultPricing.regular).total, 4750);
});
test("counts, extra bathroom, condition and regularity produce an itemised total", () => {
  const result = calculateQuote({ ...base, bathrooms: 2, condition: "dirty", frequency: "weekly", extras: ["windows", "windows", "oven"] }, defaultPricing.regular);
  assert.deepEqual({ base: result.base, bathrooms: result.bathrooms, condition: result.condition, extras: result.extras, discount: result.discount, total: result.total }, { base: 4750, bathrooms: 550, condition: 954, extras: 3050, discount: 1396, total: 7908 });
});
test("all service, size, condition and frequency combinations reconcile exactly", () => {
  for (const service of serviceKeys) for (const area of [20, 50, 80, 300]) for (const condition of ["normal", "dirty", "very_dirty"]) for (const frequency of ["once", "weekly", "biweekly"]) {
    const r = calculateQuote({ ...base, service, area, condition, frequency, bathrooms: 4, extras: ["windows", "ironing", "ironing"] }, defaultPricing[service]);
    assert.equal(r.total, r.base + r.bathrooms + r.condition + r.extras - r.discount);
    assert.ok(Number.isInteger(r.total) && r.total > 0);
    assert.ok(r.duration >= 2);
    if (service !== "regular") assert.equal(r.discount, 0);
  }
});
test("CRM price rules determine the result, not the display defaults", () => {
  assert.equal(calculateQuote(base, { rate: 120, minimum: 3500 }).total, 6000);
});
test("accept only complete Russian phone numbers", () => {
  assert.ok(validPhone("+7 (999) 123-45-67"));
  assert.ok(validPhone("89991234567"));
  for (const value of ["123", "9991234567", "+799912345678", "+19991234567"]) assert.equal(validPhone(value), false);
});
test("local date uses the Novosibirsk calendar", () => {
  assert.match(todayInNovosibirsk(), /^\d{4}-\d{2}-\d{2}$/);
});
