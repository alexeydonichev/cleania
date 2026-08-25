import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { getAuthorizedCrmUser } from "@/lib/crm-auth";

export async function POST(request: Request) {
  const auth = await getAuthorizedCrmUser();
  if (!auth.allowed)
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name || "")
    .trim()
    .slice(0, 100);
  const leadName =
    String(body.leadName || "")
      .trim()
      .slice(0, 100) || null;
  const phone =
    String(body.phone || "")
      .trim()
      .slice(0, 40) || null;
  const capacityHours = Math.min(
    24,
    Math.max(1, Number(body.capacityHours || 8)),
  );
  if (!name)
    return NextResponse.json(
      { error: "Укажите имя сотрудника или название смены" },
      { status: 400 },
    );
  const id = crypto.randomUUID();
  await rawDb()
    .prepare(
      `INSERT INTO crews (id, name, lead_name, phone, status, capacity_hours, rating, created_at) VALUES (?, ?, ?, ?, 'active', ?, 5, ?)`,
    )
    .bind(id, name, leadName, phone, capacityHours, new Date().toISOString())
    .run();
  return NextResponse.json(
    {
      ok: true,
      crew: {
        id,
        name,
        lead_name: leadName,
        phone,
        status: "active",
        capacity_hours: capacityHours,
        rating: 5,
      },
    },
    { status: 201 },
  );
}
