import { NextResponse } from "next/server";
import { getAuthorizedCrmUser } from "./crm-auth";
export async function crmAccess(request: Request, owner = false) {
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin) return { error: NextResponse.json({ error: "Обновите страницу и повторите действие" }, { status: 403 }) };
  }
  const auth = await getAuthorizedCrmUser();
  if (!auth.allowed || !auth.user || !["owner", "manager"].includes(auth.role || "") || (owner && auth.role !== "owner")) return { error: NextResponse.json({ error: "Нет доступа" }, { status: 403 }) };
  return { auth };
}
export function apiFailure(error: unknown) {
  console.error("CRM operation failed", error instanceof Error ? error.name : "unknown");
  return NextResponse.json({ error: "Не удалось сохранить. Данные формы сохранены на экране — повторите попытку." }, { status: 500 });
}
