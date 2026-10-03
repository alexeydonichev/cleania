import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { getAuthorizedCrmUser } from "@/lib/crm-auth";

export async function PATCH(request: Request) {
  const auth = await getAuthorizedCrmUser();
  if (!auth.allowed || !["owner", "manager"].includes(auth.role || ""))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Проверьте тарифы" }, { status: 400 });
  const body = input as {
    rules?: Array<{ key?: string; rate?: number; minimum?: number }>;
  };
  const rules = Array.isArray(body.rules) ? body.rules : [];
  if (
    !rules.length ||
    rules.some(
      (rule) =>
        !rule || typeof rule !== "object" || !["regular", "deep", "renovation", "office"].includes(
          String(rule.key),
        ) ||
        !Number.isFinite(Number(rule.rate)) ||
        Number(rule.rate) < 1 ||
        Number(rule.rate) > 100000 ||
        !Number.isFinite(Number(rule.minimum)) ||
        Number(rule.minimum) < 500 || Number(rule.minimum) > 10000000,
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
