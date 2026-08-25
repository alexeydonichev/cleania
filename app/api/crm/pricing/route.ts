import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { getAuthorizedCrmUser } from "@/lib/crm-auth";

export async function PATCH(request: Request) {
  const auth = await getAuthorizedCrmUser();
  if (!auth.allowed)
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const body = (await request.json()) as {
    rules?: Array<{ key?: string; rate?: number; minimum?: number }>;
  };
  const rules = Array.isArray(body.rules) ? body.rules : [];
  if (
    !rules.length ||
    rules.some(
      (rule) =>
        !["regular", "deep", "renovation", "office"].includes(
          String(rule.key),
        ) ||
        !Number.isFinite(Number(rule.rate)) ||
        Number(rule.rate) < 1 ||
        !Number.isFinite(Number(rule.minimum)) ||
        Number(rule.minimum) < 500,
    )
  )
    return NextResponse.json({ error: "Проверьте тарифы" }, { status: 400 });
  const db = rawDb();
  const now = new Date().toISOString();
  await db.batch(
    rules.map((rule) =>
      db
        .prepare(
          "UPDATE pricing_rules SET rate = ?, minimum = ?, updated_at = ? WHERE key = ?",
        )
        .bind(
          Math.round(Number(rule.rate)),
          Math.round(Number(rule.minimum)),
          now,
          rule.key,
        ),
    ),
  );
  return NextResponse.json({ ok: true });
}
