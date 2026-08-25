import { rawDb } from "@/db/runtime";

async function digest(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function checkRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds = 600,
) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const bucket = `${scope}:${await digest(`${ip}:${userAgent}`)}`;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + windowSeconds;
  const db = rawDb();
  await db
    .prepare(
      `INSERT INTO request_limits (bucket, hits, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET hits = CASE WHEN expires_at <= ? THEN 1 ELSE hits + 1 END, expires_at = CASE WHEN expires_at <= ? THEN ? ELSE expires_at END`,
    )
    .bind(bucket, expiresAt, now, now, expiresAt)
    .run();
  const row = await db
    .prepare("SELECT hits, expires_at FROM request_limits WHERE bucket = ?")
    .bind(bucket)
    .first<{ hits: number; expires_at: number }>();
  return {
    allowed: Number(row?.hits || 0) <= limit,
    retryAfter: Math.max(1, Number(row?.expires_at || expiresAt) - now),
  };
}
