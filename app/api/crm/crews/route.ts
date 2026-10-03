import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess, apiFailure } from "@/lib/crm-api";

export async function POST(request: Request) {
  try {
  const access = await crmAccess(request);
  if (access.error) return access.error;
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Проверьте данные сотрудника" }, { status: 400 });
  const body = input as Record<string, unknown>;
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
  if (!name || !Number.isFinite(capacityHours))
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
  } catch (error) { return apiFailure(error); }
}
