import { rawDb } from "@/db/runtime";

export class SubmissionError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  return JSON.stringify(value);
}

export async function readSubmission(request: Request, kind: "order" | "callback" | "business") {
  const text = await request.text();
  if (text.length > 32768) throw new SubmissionError("Заявка слишком большая. Сократите комментарий.", 413);
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new SubmissionError("Не удалось прочитать заявку.", 400); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new SubmissionError("Проверьте данные заявки.", 400);
  const body = parsed as Record<string, unknown>;
  // Old clients remain compatible; updated forms supply an unpredictable UUID.
  const requestId = body.requestId === undefined ? crypto.randomUUID() : body.requestId;
  if (typeof requestId !== "string" || !/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(requestId)) throw new SubmissionError("Обновите страницу и повторите отправку.", 400);
  const payload = { ...body }; delete payload.requestId;
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(payload)));
  return { body, key: `${kind}:${requestId.toLowerCase()}`, fingerprint: Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,"0")).join("") };
}

type Submission = Awaited<ReturnType<typeof readSubmission>>;
type Receipt = Record<string, unknown>;
export async function existingSubmission(submission: Submission): Promise<Receipt | null> {
  const row = await rawDb().prepare("SELECT fingerprint, response_json FROM public_submissions WHERE request_key = ?").bind(submission.key).first<{fingerprint: string; response_json: string}>();
  if (!row) return null;
  if (row.fingerprint !== submission.fingerprint) throw new SubmissionError("Эта отправка уже сохранена с другими данными. Обновите страницу перед новой заявкой.", 409);
  return JSON.parse(row.response_json) as Receipt;
}

/** D1 batch is atomic: the receipt and all customer records commit together. */
export async function saveSubmission(submission: Submission, response: Receipt, statements: ReturnType<ReturnType<typeof rawDb>["prepare"]>[]) {
  const db = rawDb();
  try {
    await db.batch([
      db.prepare("INSERT INTO public_submissions (request_key, fingerprint, response_json, created_at) VALUES (?, ?, ?, ?)").bind(submission.key, submission.fingerprint, JSON.stringify(response), new Date().toISOString()),
      ...statements,
    ]);
    return { response, created: true };
  } catch (error) {
    // A concurrent identical request may have committed first. No second lead,
    // order, activity or notification is created by the rolled-back batch.
    const existing = await existingSubmission(submission);
    if (existing) return { response: existing, created: false };
    throw error;
  }
}
