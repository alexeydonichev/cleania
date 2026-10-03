import { env } from "@/lib/runtime-env";
import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";
import { INSERT_PHOTOS_WITH_QUOTA, MAX_PHOTO_BYTES, photoExtension, readUploadForm, UploadInputError } from "@/lib/upload-validation";

export async function POST(request: Request, context: { params: Promise<{ orderNumber: string }> }) {
  const bucket = (env as typeof env & { FILES?: R2Bucket }).FILES;
  const uploadedKeys: string[] = [];
  let committed = false;
  let insertionAttempted = false;
  try {
    await ensureDatabase();
    const { orderNumber } = await context.params;
    const token = request.headers.get("x-upload-token");
    if (!token) return NextResponse.json({ error: "Нет токена загрузки" }, { status: 401 });
    const order = await rawDb().prepare("SELECT id FROM orders WHERE order_number = ? AND upload_token = ?")
      .bind(orderNumber, token).first<{ id: string }>();
    if (!order) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    if (!bucket) return NextResponse.json({ error: "Хранилище фотографий не подключено" }, { status: 503 });
    const body = await readUploadForm(request);
    const entries = body.getAll("files");
    if (!entries.length || entries.length > 5 || entries.some(item => !(item instanceof File))) {
      throw new UploadInputError("Можно загрузить от 1 до 5 фотографий");
    }
    const files = entries as File[];
    // Validate the entire batch before writing a single object.
    const prepared = await Promise.all(files.map(async file => {
      if (!file.size || file.size > MAX_PHOTO_BYTES) throw new UploadInputError("Каждая фотография должна быть от 1 байта до 8 МБ");
      const extension = photoExtension(new Uint8Array(await file.slice(0, 64).arrayBuffer()), file.type);
      if (!extension) throw new UploadInputError("Файл должен быть фотографией JPG, PNG, WEBP или HEIC");
      return { id: crypto.randomUUID(), key: `orders/${order.id}/${crypto.randomUUID()}.${extension}`,
        name: file.name.slice(0, 180), type: file.type, size: file.size };
    }));
    for (let i = 0; i < files.length; i++) {
      uploadedKeys.push(prepared[i].key);
      await bucket.put(prepared[i].key, files[i].stream(), { httpMetadata: { contentType: prepared[i].type } });
    }
    insertionAttempted = true;
    const result = await rawDb().prepare(INSERT_PHOTOS_WITH_QUOTA)
      .bind(order.id, new Date().toISOString(), JSON.stringify(prepared), order.id, prepared.length).run();
    if (result.meta.changes !== prepared.length) throw new UploadInputError("Для одного заказа можно хранить не более 10 фотографий", 409);
    committed = true;
    return NextResponse.json({ ok: true, files: prepared.map(file => file.id) }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadInputError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("order_files_upload_failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Не удалось загрузить фотографии" }, { status: 500 });
  } finally {
    if (!committed && bucket && uploadedKeys.length) {
      try {
        // A transport failure may hide a successful DB commit. Never delete referenced objects.
        const referenced = insertionAttempted
          ? await rawDb().prepare("SELECT object_key FROM uploaded_files WHERE object_key IN (SELECT value FROM json_each(?))")
            .bind(JSON.stringify(uploadedKeys)).all<{ object_key: string }>()
          : { results: [] };
        const kept = new Set(referenced.results.map(file => file.object_key));
        const orphaned = uploadedKeys.filter(key => !kept.has(key));
        if (orphaned.length) await bucket.delete(orphaned);
      }
      catch { console.error("order_files_cleanup_failed"); }
    }
  }
}
