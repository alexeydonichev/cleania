import { env } from "cloudflare:workers";
import {
  getChatGPTUser,
  requireChatGPTUser,
  type ChatGPTUser,
} from "@/app/chatgpt-auth";
import { ensureDatabase, rawDb } from "@/db/runtime";

type RuntimeEnv = typeof env & { CRM_OWNER_EMAILS?: string };

export type CrmAuthorization = {
  allowed: boolean;
  user: ChatGPTUser | null;
  role: string | null;
};

async function authorize(user: ChatGPTUser | null): Promise<CrmAuthorization> {
  if (!user) return { allowed: false, user: null, role: null };
  await ensureDatabase();
  const db = rawDb();
  const runtime = env as RuntimeEnv;
  const allowlist = (runtime.CRM_OWNER_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const email = user.email.toLowerCase();
  const now = new Date().toISOString();
  const existing = await db
    .prepare("SELECT role FROM crm_users WHERE lower(email) = ?")
    .bind(email)
    .first<{ role: string }>();

  if (allowlist.length > 0 && !allowlist.includes(email) && !existing)
    return { allowed: false, user, role: null };
  if (!existing && allowlist.length === 0) {
    // Never allow a public production visitor to become the first CRM owner.
    // Local development keeps the one-time bootstrap flow for smoke testing.
    if (process.env.NODE_ENV === "production")
      return { allowed: false, user, role: null };
    const count = await db
      .prepare("SELECT COUNT(*) AS count FROM crm_users")
      .first<{ count: number }>();
    if (Number(count?.count || 0) > 0)
      return { allowed: false, user, role: null };
  }

  const role = existing?.role || "owner";
  await db
    .prepare(
      `INSERT INTO crm_users (id, email, full_name, role, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET full_name = excluded.full_name, last_seen_at = excluded.last_seen_at`,
    )
    .bind(user.userId, user.email, user.fullName, role, now, now)
    .run();
  return { allowed: true, user, role };
}

export async function requireCrmUser(returnTo = "/crm") {
  return authorize(await requireChatGPTUser(returnTo));
}

export async function getAuthorizedCrmUser() {
  return authorize(await getChatGPTUser());
}
