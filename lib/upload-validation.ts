export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 5 * MAX_PHOTO_BYTES + 64 * 1024;

export class UploadInputError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

// Signature checks are format validation, not a full decoder or malware scanner.
export function photoExtension(bytes: Uint8Array, mime: string): string | null {
  const starts = (values: number[]) => values.every((value, i) => bytes[i] === value);
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (mime === "image/jpeg" && starts([255, 216, 255])) return "jpg";
  if (mime === "image/png" && starts([137, 80, 78, 71, 13, 10, 26, 10])) return "png";
  if (mime === "image/webp" && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (mime === "image/heic" && ascii(4, 8) === "ftyp") {
    const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
    const brands = new Set(["heic", "heix", "hevc", "hevx"]);
    if (size >= 16 && brands.has(ascii(8, 12))) return "heic";
    for (let i = 16; i + 4 <= Math.min(size, bytes.length); i += 4) {
      if (brands.has(ascii(i, i + 4))) return "heic";
    }
  }
  return null;
}

export async function readUploadForm(request: Request): Promise<FormData> {
  const tooLarge = () => new UploadInputError("Общий размер фотографий превышает 40 МБ", 413);
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES) throw tooLarge();
  if (!request.body) throw new UploadInputError("Добавьте фотографии");
  let bytes = 0;
  let oversized = false;
  const body = request.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bytes += chunk.byteLength;
      if (bytes > MAX_UPLOAD_BYTES) { oversized = true; throw tooLarge(); }
      controller.enqueue(chunk);
    },
  }));
  try {
    return await new Response(body, { headers: { "content-type": request.headers.get("content-type") || "" } }).formData();
  } catch {
    if (oversized) throw tooLarge();
    throw new UploadInputError("Не удалось прочитать фотографии. Выберите файлы заново");
  }
}

// The quota decision and all metadata insertions run in one serialized SQL statement.
export const INSERT_PHOTOS_WITH_QUOTA = `
  INSERT INTO uploaded_files (id, order_id, object_key, file_name, content_type, size, created_at)
  SELECT json_extract(value, '$.id'), ?, json_extract(value, '$.key'),
         json_extract(value, '$.name'), json_extract(value, '$.type'),
         json_extract(value, '$.size'), ?
  FROM json_each(?)
  WHERE (SELECT COUNT(*) FROM uploaded_files WHERE order_id = ?) + ? <= 10
`;
