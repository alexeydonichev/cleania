import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { getAuthorizedCrmUser } from "@/lib/crm-auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthorizedCrmUser();
  if (!auth.allowed)
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { id } = await context.params;
  const file = await rawDb()
    .prepare(
      "SELECT object_key, file_name, content_type FROM uploaded_files WHERE id = ?",
    )
    .bind(id)
    .first<{ object_key: string; file_name: string; content_type: string }>();
  if (!file)
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  const runtime = env as typeof env & { FILES?: R2Bucket };
  const object = await runtime.FILES?.get(file.object_key);
  if (!object)
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  return new Response(object.body, {
    headers: {
      "content-type": file.content_type,
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.file_name)}`,
      "cache-control": "private, max-age=300",
      "x-content-type-options": "nosniff",
    },
  });
}
