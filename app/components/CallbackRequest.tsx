"use client";
import { useRef, useState, type FormEvent } from "react";
import { validPhone } from "@/lib/quote";
import { readAttribution } from "@/lib/attribution";
import { trackConversion } from "@/lib/analytics";
import { isPreviewDeployment } from "@/lib/deployment";
import ContactLinks from "./ContactLinks";

export default function CallbackRequest() {
  const [busy, setBusy] = useState(false); const pending = useRef(false);
  const [error, setError] = useState(""); const [sent, setSent] = useState(false);
  const [draft, setDraft] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending.current || sent) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim(); const phone = String(form.get("phone") || "").trim();
    if (!name || !validPhone(phone) || form.get("consent") !== "on") { setError("Укажите имя, телефон из 11 цифр с +7 или 8 и согласие."); return; }
    const text = `Здравствуйте! Прошу перезвонить по поводу уборки. Меня зовут ${name}, телефон ${phone}.`;
    pending.current = true; setBusy(true); setError(""); setDraft("");
    try {
      const response = await fetch("/api/callback-requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, phone, consent: true, attribution: readAttribution() }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Не удалось отправить заявку.");
      setSent(true); trackConversion("callback_submit");
    } catch (error) { setError(error instanceof Error ? error.message : "Нет связи с сервером."); setDraft(text); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section className="callback-card" id="callback" aria-labelledby="callback-heading"><div><p className="eyebrow">Можно просто поговорить</p><h2 id="callback-heading">Перезвоните мне</h2><p>Не хочется разбираться с калькулятором? Оставьте имя и телефон. Обсудим задачу и поможем выбрать уборку.</p></div>{isPreviewDeployment ? <ContactLinks /> : sent ? <p role="status">Просьба о звонке сохранена. Мы свяжемся с вами, чтобы обсудить уборку.</p> : <form onSubmit={submit} aria-busy={busy}><label>Ваше имя<input name="name" autoComplete="name" maxLength={100} required /></label><label>Телефон<input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+7 983 000-00-00" required /></label><label className="consent"><input type="checkbox" name="consent" required /><span>Согласен на обработку данных для ответа на обращение. <a href="/privacy">Политика конфиденциальности</a></span></label><button className="button" disabled={busy}>{busy ? "Отправляем…" : "Жду звонка"}</button>{error && <p role="alert">{error}</p>}{draft && <ContactLinks showPhone={false} message={draft} />}</form>}</section>;
}
