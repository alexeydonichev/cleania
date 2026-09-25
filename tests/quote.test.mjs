import test from "node:test";
import assert from "node:assert/strict";
import { calculateQuote, formatQuoteForMessage, isServiceCompatibleWithProperty, maxQuoteArea, needsSiteSurvey, propertyTypes, defaultPricing, serviceKeys, validPhone, todayInNovosibirsk } from "../lib/quote.ts";

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

test("message receipt itemises repeated extras, conditions, discounts and the exact total", () => {
  const input = { ...base, bathrooms: 2, condition: "dirty", frequency: "weekly", extras: ["windows", "oven", "windows"] };
  const original = structuredClone(input);
  const receipt = formatQuoteForMessage(input, "Бердск", defaultPricing.regular).replaceAll('\u00a0', ' ');
  assert.match(receipt, /Бердск · Квартира · 50 м²/);
  assert.match(receipt, /Тариф для расчёта: Поддерживающая/);
  assert.match(receipt, /Санузлы: 2 \(\+550 ₽\)/);
  assert.match(receipt, /Загрязнения: \+18% \(\+954 ₽\)/);
  assert.match(receipt, /Мойка окна × 2: \+2 400 ₽/);
  assert.equal(receipt.match(/Мойка окна/g).length, 1);
  assert.match(receipt, /Духовка внутри × 1: \+650 ₽/);
  assert.match(receipt, /Каждую неделю · −15%: −1 396 ₽/);
  assert.match(receipt, /Итого за уборку: 7 908 ₽/);
  assert.match(receipt, /не оформленный заказ/);
  assert.deepEqual(input, original);
});

test("message receipt follows live pricing and excludes unselected charges", () => {
  const receipt = formatQuoteForMessage(base, "Новосибирск", { ...defaultPricing.regular, rate: 120 }).replaceAll('\u00a0', ' ');
  assert.match(receipt, /Итого за уборку: 6 000 ₽/);
  assert.match(receipt, /Санузлы: 1 \(включено\)/);
  assert.doesNotMatch(receipt, /Загрязнения:|Мойка окна|Каждую неделю|Раз в 2 недели/);
});

test("property limits match the requested area ranges", () => {
  for (const [propertyType, max] of [['apartment',482], ['house',1150], ['commercial',2500], ['industrial',4000]]) {
    assert.equal(propertyTypes[propertyType].maxArea, max);
    assert.equal(maxQuoteArea({ ...base, propertyType }), max);
    const input = { ...base, propertyType, area: max };
    assert.ok(Number.isFinite(calculateQuote(input, defaultPricing.regular).total));
    assert.equal(needsSiteSurvey(input), true);
    assert.match(formatQuoteForMessage(input, 'Бердск', defaultPricing.regular), /после оценки объекта/);
  }
  assert.equal(maxQuoteArea(base), 482);
  assert.equal(maxQuoteArea({ ...base, service: 'office' }), 2500);
  assert.equal(needsSiteSurvey(base), false);
  assert.equal(needsSiteSurvey({ ...base, propertyType: 'industrial' }), true);
});

test("business objects cannot use residential tariffs and homes cannot use the office tariff", () => {
  assert.equal(isServiceCompatibleWithProperty({ propertyType: "commercial", service: "office" }), true);
  assert.equal(isServiceCompatibleWithProperty({ propertyType: "industrial", service: "office" }), true);
  assert.equal(isServiceCompatibleWithProperty({ propertyType: "commercial", service: "regular" }), false);
  assert.equal(isServiceCompatibleWithProperty({ propertyType: "industrial", service: "deep" }), false);
  assert.equal(isServiceCompatibleWithProperty({ propertyType: "apartment", service: "office" }), false);
  assert.equal(isServiceCompatibleWithProperty({ propertyType: "house", service: "office" }), false);
});

test("large-object messages clearly distinguish a preliminary estimate from a final price", () => {
  const receipt = formatQuoteForMessage(
    { ...base, propertyType: "industrial", service: "office", area: 4000, extras: ["windows"] },
    "Новосибирск",
    defaultPricing.office,
  ).replaceAll("\u00a0", " ");
  assert.match(receipt, /Новосибирск · Промышленный объект · 4000 м²/);
  assert.match(receipt, /Тариф для расчёта: Офис/);
  assert.match(receipt, /Предварительный ориентир по выбранной комплектации:/);
  assert.match(receipt, /после оценки объекта/);
  assert.doesNotMatch(receipt, /Итого за уборку:/);
});
