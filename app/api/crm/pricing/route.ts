import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess, apiFailure } from "@/lib/crm-api";
import { pricingUpdateStatement, validatePricingUpdates } from "@/lib/pricing-update";

export async function PATCH(request: Request) {
  try {
  const access = await crmAccess(request, true);
  if (access.error) return access.error;
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Проверьте тарифы" }, { status: 400 });
  let rules;
  try { rules = validatePricingUpdates((input as {rules?:unknown}).rules); }
  catch { return NextResponse.json({ error: "Проверьте тарифы. Если страница открыта давно, нажмите «Обновить»." }, { status: 400 }); }
  const db = rawDb();
  const statement = pricingUpdateStatement(rules, `${new Date().toISOString()}:${crypto.randomUUID()}`);
  const result = await db.prepare(statement.sql).bind(...statement.values).run();
  if (!result.meta.changes) return NextResponse.json({ error: "Тарифы уже изменены в другой вкладке. Ваши значения не сохранены. Нажмите «Обновить» и проверьте новые цены." }, { status: 409 });
  return NextResponse.json({ ok: true });
  } catch (error) { return apiFailure(error); }
}
