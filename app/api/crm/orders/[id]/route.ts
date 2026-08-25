import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { getAuthorizedCrmUser } from "@/lib/crm-auth";

const statuses = new Set([
  "new",
  "confirmed",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthorizedCrmUser();
  if (!auth.allowed || !auth.user)
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const status = String(body.status || "");
  if (!statuses.has(status))
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  const finalTotal =
    body.finalTotal === undefined || body.finalTotal === null
      ? null
      : Math.max(0, Math.round(Number(body.finalTotal)));
  const cleanerCost = Math.max(0, Math.round(Number(body.cleanerCost || 0)));
  const suppliesCost = Math.max(0, Math.round(Number(body.suppliesCost || 0)));
  const acquisitionCost = Math.max(
    0,
    Math.round(Number(body.acquisitionCost || 0)),
  );
  const otherCost = Math.max(0, Math.round(Number(body.otherCost || 0)));
  const now = new Date().toISOString();
  const result = await rawDb()
    .prepare(
      `UPDATE orders SET status = ?, final_total = COALESCE(?, final_total), cleaner_cost = ?, supplies_cost = ?, acquisition_cost = ?, other_cost = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      status,
      finalTotal,
      cleanerCost,
      suppliesCost,
      acquisitionCost,
      otherCost,
      now,
      id,
    )
    .run();
  if (!result.meta.changes)
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  await rawDb()
    .prepare(
      `INSERT INTO activities (id, order_id, actor_id, type, body, created_at) VALUES (?, ?, ?, 'status_changed', ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      id,
      auth.user.userId,
      `Статус изменён на ${status}`,
      now,
    )
    .run();
  return NextResponse.json({ ok: true });
}
