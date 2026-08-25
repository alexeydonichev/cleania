import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  try {
    await ensureDatabase();
    const { orderNumber } = await context.params;
    const uploadToken = request.headers.get("x-upload-token");
    if (!uploadToken)
      return NextResponse.json(
        { error: "Нет токена загрузки" },
        { status: 401 },
      );

    const order = await rawDb()
      .prepare(
        "SELECT id FROM orders WHERE order_number = ? AND upload_token = ?",
      )
      .bind(orderNumber, uploadToken)
      .first<{ id: string }>();
    if (!order)
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });

    const body = await request.formData();
    const files = body
      .getAll("files")
      .filter((item): item is File => item instanceof File);
    if (!files.length || files.length > 5)
      return NextResponse.json(
        { error: "Можно загрузить от 1 до 5 фотографий" },
        { status: 400 },
      );
    const existingFiles = await rawDb()
      .prepare("SELECT COUNT(*) AS count FROM uploaded_files WHERE order_id = ?")
      .bind(order.id)
      .first<{ count: number }>();
    if (Number(existingFiles?.count || 0) + files.length > 10)
      return NextResponse.json(
        { error: "Для одного заказа можно хранить не более 10 фотографий" },
        { status: 400 },
      );

    const runtime = env as typeof env & { FILES?: R2Bucket };
    if (!runtime.FILES)
      return NextResponse.json(
        { error: "Хранилище фотографий не подключено" },
        { status: 503 },
      );
    const now = new Date().toISOString();
    const saved: string[] = [];

    for (const file of files) {
      if (!allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Поддерживаются JPG, PNG, WEBP и HEIC до 8 МБ" },
          { status: 400 },
        );
      }
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";
      const objectKey = `orders/${order.id}/${crypto.randomUUID()}.${extension}`;
      await runtime.FILES.put(objectKey, file.stream(), {
        httpMetadata: { contentType: file.type },
      });
      const fileId = crypto.randomUUID();
      await rawDb()
        .prepare(
          "INSERT INTO uploaded_files (id, order_id, object_key, file_name, content_type, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          fileId,
          order.id,
          objectKey,
          file.name.slice(0, 180),
          file.type,
          file.size,
          now,
        )
        .run();
      saved.push(fileId);
    }

    return NextResponse.json({ ok: true, files: saved }, { status: 201 });
  } catch (error) {
    console.error("order_files_upload_failed", error);
    return NextResponse.json(
      { error: "Не удалось загрузить фотографии" },
      { status: 500 },
    );
  }
}
