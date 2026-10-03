import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess, apiFailure } from "@/lib/crm-api";
import { textField, enumField } from "@/lib/crm-validation";
import { validPhone } from "@/lib/quote";
import { readSubmission, existingSubmission, saveSubmission, SubmissionError } from "@/lib/public-submissions";

const conflictMessage = "Обращение уже сохранено с другими данными. Найдите его в списке и внесите изменения в карточке. Введённые данные остаются в форме.";

export async function POST(request: Request) {
  try {
    const access = await crmAccess(request);
    if (access.error) return access.error;
    const submission = await readSubmission(request, "crm-lead");
    const body = submission.body;
    let name, phone, city, notes, source, id;
    try {
      name = textField(body.name, 100, true);
      phone = textField(body.phone, 40, true);
      city = textField(body.city, 100, true);
      notes = textField(body.notes, 4000);
      source = enumField(body.source, ["direct", "referral", "maps", "ads"]);
      id = textField(body.id, 50, true);
      if (!validPhone(phone) || body.consent !== true) throw new Error("Проверьте телефон и подтвердите согласие клиента");
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Проверьте поля" }, { status: 400 });
    }
    const existing = await existingSubmission(submission);
    if (existing) return NextResponse.json(existing);
    const db = rawDb();
    // Legacy entries have no receipt. Never acknowledge a suppressed insert as a save.
    if (await db.prepare("SELECT id FROM leads WHERE id = ?").bind(id).first()) {
      const concurrent = await existingSubmission(submission);
      if (concurrent) return NextResponse.json(concurrent);
      return NextResponse.json({ error: conflictMessage }, { status: 409 });
    }
    const now = new Date().toISOString();
    const saved = await saveSubmission(submission, { ok: true, id }, [
      db.prepare("INSERT INTO leads(id,name,phone,city,source,status,notes,consent_at,created_at,updated_at) VALUES(?,?,?,?,?,'new',?,?,?,?)")
        .bind(id, name, phone, city, source, notes, now, now, now),
      db.prepare("INSERT INTO activities(id,lead_id,actor_id,type,body,created_at) VALUES(?,?,?,'lead_created','Обращение добавлено менеджером; согласие подтверждено',?)")
        .bind(crypto.randomUUID(), id, access.auth!.user!.userId, now),
    ]);
    return NextResponse.json(saved.response, { status: saved.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof SubmissionError) {
      return NextResponse.json({ error: error.status === 409 ? conflictMessage : error.message }, { status: error.status });
    }
    return apiFailure(error);
  }
}
