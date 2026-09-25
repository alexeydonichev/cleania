"use client";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { useBooking } from "./BookingProvider";
import MotionPanel from "./MotionPanel";
import PriceAmount from "./PriceAmount";
import { isPreviewDeployment } from "@/lib/deployment";
import { focusVisible, scrollToContent } from "@/lib/motion";
import { extrasCatalog, money, serviceKeys, todayInNovosibirsk, validPhone, type City, type ConditionKey, type ExtraKey, type FrequencyKey } from "@/lib/quote";

const stepNames = ["Ваша уборка", "Дополнительно", isPreviewDeployment ? "Ваш расчёт" : "Дата и контакты"];
const serviceDescriptions = { regular: "Для привычного порядка", deep: "Детально, до каждого угла", renovation: "После строительных работ", office: "Рабочее пространство" };
const fileTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export default function OrderCalculator() {
  const { input, update, city, setCity, pricing, pricingStatus, refreshPricing, quote } = useBooking();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  useEffect(() => {
    const section = document.getElementById("calculator");
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => setCalculatorVisible(entries[0].isIntersecting), { threshold: 0 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  const [success, setSuccess] = useState<{ order: string; total: number; warning: string; phone: string; city: City; area: number } | null>(null);
  const sendingRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [areaDraft, setAreaDraft] = useState(String(input.area));
  const [lastArea, setLastArea] = useState(input.area);
  if (lastArea !== input.area) { setLastArea(input.area); setAreaDraft(String(input.area)); }
  const extraKeys = Object.keys(extrasCatalog) as ExtraKey[];
  const counts = Object.fromEntries(extraKeys.map(key => [key, input.extras.filter(item => item === key).length])) as Record<ExtraKey, number>;
  function setCount(key: ExtraKey, count: number) { update({ extras: [...input.extras.filter(item => item !== key), ...Array<ExtraKey>(Math.max(0, Math.min(extrasCatalog[key].max, count))).fill(key)] }); }
  function moveTo(next: number) {
    if (next === step || sendingRef.current) return;
    setDirection(next > step ? 1 : -1);
    setStep(next); setError("");
    window.requestAnimationFrame(() => {
      scrollToContent(formRef.current);
      formRef.current?.querySelector<HTMLElement>(".booking-step-heading h3")?.focus({ preventScroll: true });
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendingRef.current || success) return;
    if (step < 2) { moveTo(step + 1); return; }
    if (isPreviewDeployment) return;
    setError("");
    if (!name.trim()) { setError("Пожалуйста, укажите ваше имя."); focusVisible(nameRef.current); return; }
    if (!validPhone(phone)) { setError("Укажите номер из 11 цифр, начиная с +7 или 8."); focusVisible(phoneRef.current); return; }
    if (date && date < todayInNovosibirsk()) { setError("Выберите сегодняшнюю или будущую дату."); focusVisible(dateRef.current); return; }
    if (!consent) { setError("Подтвердите согласие на обработку данных для заявки."); focusVisible(consentRef.current); return; }
    if (fileError) { setError("Проверьте выбранные фотографии."); return; }
    if (pricingStatus !== "ready") { setError("Не удалось проверить тарифы. Обновите их перед отправкой."); return; }
    sendingRef.current = true; setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...input, city, preferredDate: date || null, preferredSlot: slot || null, address: address.trim(), comment: comment.trim(), name: name.trim(), phone: phone.trim(), consent, expectedEstimate: quote.total }) });
      const data = await response.json() as { error?: string; orderNumber?: string; estimate?: number; uploadToken?: string };
      if (!response.ok) { if (response.status === 409) refreshPricing(); throw new Error(data.error || "Не удалось отправить заявку. Попробуйте ещё раз."); }
      if (!data.orderNumber || data.estimate === undefined) throw new Error("Не получили номер заявки. Свяжитесь с нами через страницу контактов.");
      let warning = "";
      if (files.length && data.uploadToken) {
        try {
          const upload = new FormData(); files.forEach(file => upload.append("files", file));
          const result = await fetch(`/api/orders/${data.orderNumber}/files`, { method: "POST", headers: { "x-upload-token": data.uploadToken }, body: upload });
          if (!result.ok) throw new Error("upload");
        } catch { warning = "Заявка сохранена, но фото не загрузились. Передайте их менеджеру при подтверждении — новую заявку создавать не нужно."; }
      }
      setSuccess({ order: data.orderNumber, total: data.estimate, warning, phone, city, area: input.area });
      window.requestAnimationFrame(() => focusVisible(document.getElementById("order-success")));
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось отправить заявку. Ваши данные остались в форме."); }
    finally { sendingRef.current = false; setIsSubmitting(false); }
  }
  if (success) return <div className="order-success" id="order-success" tabIndex={-1} role="status">
    <span className="success-icon" aria-hidden="true">✓</span><p className="eyebrow">Заявка {success.order}</p><h3>Ещё один шаг<br />к чистому дому.</h3><p>Мы получили заявку и свяжемся с вами по номеру <b>{success.phone}</b>, чтобы подтвердить время и стоимость.</p>
    <div className="success-receipt"><span>{success.city} · {success.area} м²</span><strong>{money(success.total)} ₽</strong><small>Предварительная стоимость · время ещё не забронировано</small></div>
    {success.warning && <p className="form-message error">{success.warning}</p>}
    <button className="button" type="button" onClick={() => { setSuccess(null); setStep(0); setFiles([]); setFileError(""); setError(""); setConsent(false); setName(""); setPhone(""); setDate(""); setSlot(""); setAddress(""); setComment(""); window.requestAnimationFrame(() => { scrollToContent(formRef.current); formRef.current?.querySelector<HTMLElement>(".booking-step-heading h3")?.focus({ preventScroll: true }); }); }}>Рассчитать другую уборку</button>
  </div>;
  return <div className="booking-layout">
    <form id="order-form" className="booking-form" ref={formRef} noValidate aria-busy={isSubmitting} onChange={() => setError("")} onSubmit={submit}>
      <nav className="booking-progress" aria-label="Шаги оформления" style={{ "--active-step": step } as CSSProperties}>{stepNames.map((label, i) => <button key={label} type="button" disabled={isSubmitting} aria-current={step === i ? "step" : undefined} onClick={() => moveTo(i)}><span>{i < step ? "✓" : i + 1}</span><b>{label}</b></button>)}</nav>
      <fieldset disabled={isSubmitting} aria-label="Параметры заявки"><MotionPanel transitionKey={step} direction={direction}><div className="booking-step">
      {step === 0 && <>
        <div className="booking-step-heading"><h3 tabIndex={-1}>Расскажите о вашем доме</h3><span>Шаг 1 из 3</span></div>
        <fieldset className="city-picker"><legend>Где нужна уборка?</legend>{(["Новосибирск", "Бердск"] as City[]).map(item => <label key={item} className={city === item ? "selected" : ""}><input type="radio" name="city" checked={city === item} onChange={() => setCity(item)} />{item}</label>)}</fieldset>
        <fieldset className="service-picker"><legend>Какую уборку выбираем?</legend><div>{serviceKeys.map(key => <label className={input.service === key ? "selected" : ""} key={key}><input type="radio" name="service" checked={input.service === key} onChange={() => update({ service: key })} /><span><b>{pricing[key].label}</b><small>{serviceDescriptions[key]}</small></span><span className="radio-mark" aria-hidden="true" /></label>)}</div></fieldset>
        <div className="area-and-bathrooms">
          <div className="area-control"><label htmlFor="area-number">Площадь помещения</label><div className="area-number"><input id="area-number" type="number" min={20} max={300} step={1} value={areaDraft} onChange={e => { setAreaDraft(e.target.value); const n = Number(e.target.value); if (Number.isInteger(n) && n >= 20 && n <= 300) update({ area: n }); }} onBlur={() => { const value = Math.min(300, Math.max(20, Math.round(Number(areaDraft) || input.area))); update({ area: value }); setAreaDraft(String(value)); }} /><span>м²</span></div><input aria-label="Площадь ползунком" style={{ "--range-progress": `${(input.area - 20) / 280 * 100}%` } as CSSProperties} type="range" min={20} max={300} step={1} value={input.area} onChange={e => update({ area: Number(e.target.value) })} /><div className="range-limits"><span>20 м²</span><span>300 м²</span></div></div>
          <div className="bathroom-control"><span>Санузлы</span><div className="counter"><button type="button" aria-label="Убрать санузел" disabled={input.bathrooms === 1} onClick={() => update({ bathrooms: input.bathrooms - 1 })}>−</button><output><span key={input.bathrooms}>{input.bathrooms}</span></output><button type="button" aria-label="Добавить санузел" disabled={input.bathrooms === 4} onClick={() => update({ bathrooms: input.bathrooms + 1 })}>+</button></div><small>Первый включён.<br />Следующий +550 ₽.</small></div>
        </div>
        <label className="booking-field"><span>Состояние помещения</span><select value={input.condition} onChange={e => update({ condition: e.target.value as ConditionKey })}><option value="normal">Обычные загрязнения — без наценки</option><option value="dirty">Давно не убирали · +18% к уборке</option><option value="very_dirty">Сильные загрязнения · +35% к уборке</option></select></label>
        {input.service === "regular" && <fieldset className="frequency-picker"><legend>Как часто нужна уборка?</legend>{([["once", "Один раз", ""], ["biweekly", "Раз в 2 недели", "−10%"], ["weekly", "Каждую неделю", "−15%"]] as const).map(([value,label,discount]) => <label className={input.frequency === value ? "selected" : ""} key={value}><input type="radio" name="frequency" checked={input.frequency === value} onChange={() => update({ frequency: value as FrequencyKey })} /><span>{label}</span>{discount && <b>{discount}</b>}</label>)}</fieldset>}
        <p className="booking-help">Для площади больше 300 м², сложного остекления или специальных работ <Link href="/business">заполните короткий бриф</Link>.</p>
      </>}
      {step === 1 && <>
        <div className="booking-step-heading"><h3 tabIndex={-1}>Маленькие задачи.<br />Большая разница.</h3><span>Шаг 2 из 3</span></div>
        <p className="step-intro">Добавьте только то, что нужно вам. Все цены — за указанную единицу.</p>
        <div className="booking-extras">{extraKeys.map(key => <div key={key} className={counts[key] ? "booking-extra selected" : "booking-extra"}><div><h4>{extrasCatalog[key].label}</h4><small>{extrasCatalog[key].unit}</small><b>{money(extrasCatalog[key].price)} ₽</b></div><div className="counter"><button type="button" aria-label={`Убрать: ${extrasCatalog[key].label}`} disabled={!counts[key]} onClick={() => setCount(key, counts[key] - 1)}>−</button><output aria-label={`Количество: ${extrasCatalog[key].label}`}><span key={counts[key]}>{counts[key]}</span></output><button type="button" aria-label={`Добавить: ${extrasCatalog[key].label}`} disabled={counts[key] >= extrasCatalog[key].max} onClick={() => setCount(key, counts[key] + 1)}>+</button></div></div>)}</div>
        <p className="booking-help">Химчистка, фасадные работы и вывоз строительного мусора не входят в расчёт. Напишите о них в пожеланиях — обсудим возможность и отдельную смету.</p>
      </>}
      {step === 2 && isPreviewDeployment && <div className="preview-card">
        <div className="booking-step-heading"><h3 tabIndex={-1}>Ваш расчёт готов</h3><span>Шаг 3 из 3</span></div>
        <p>{city} · {pricing[input.service].label} · {input.area} м²</p>
        <strong className="preview-total">{money(quote.total)} ₽</strong>
        <p>Это демонстрация калькулятора. Все выбранные работы учтены в подробной смете. После подключения базы здесь появится выбор даты и отправка заявки.</p>
        <p className="preview-caption">Сейчас мы не запрашиваем телефон, адрес и фотографии. Заказ не создан.</p>
      </div>}
      {step === 2 && !isPreviewDeployment && <>
        <div className="booking-step-heading"><h3 tabIndex={-1}>Когда вам удобно?</h3><span>Шаг 3 из 3</span></div>
        <div className="booking-contact-grid">
          <label className="booking-field"><span>Желаемая дата</span><input ref={dateRef} type="date" min={todayInNovosibirsk()} value={date} onChange={e => setDate(e.target.value)} /></label>
          <label className="booking-field"><span>Желаемое время</span><select value={slot} onChange={e => setSlot(e.target.value)}><option value="">Обсудим с менеджером</option><option value="09:00–12:00">Утро · 09:00–12:00</option><option value="12:00–15:00">День · 12:00–15:00</option><option value="15:00–18:00">Вечер · 15:00–18:00</option></select></label>
          <p className="booking-help full-width">Это ваши пожелания. Дату и начало уборки подтвердим после заявки.</p>
          <label className="booking-field"><span>Как к вам обращаться? *</span><input ref={nameRef} name="customerName" autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" /></label>
          <label className="booking-field"><span>Номер телефона *</span><input ref={phoneRef} name="customerPhone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 999 123-45-67" /></label>
          <label className="booking-field full-width"><span>Адрес в городе {city} <small>— необязательно</small></span><input autoComplete="street-address" maxLength={300} value={address} onChange={e => setAddress(e.target.value)} placeholder="Улица и дом; квартиру можно сообщить позже" /></label>
          <label className="booking-field full-width"><span>Важные пожелания <small>— необязательно</small></span><textarea rows={3} maxLength={1000} value={comment} onChange={e => setComment(e.target.value)} placeholder="Есть питомцы, деликатные поверхности или особые задачи?" /></label>
        </div>
        <label className="file-field"><input type="file" accept={fileTypes.join(",")} multiple onChange={e => { const list = Array.from(e.target.files || []); if (list.length > 5 || list.some(f => !fileTypes.includes(f.type) || f.size > 8 * 1024 * 1024)) { setFileError("Выберите до 5 фото JPG, PNG, WEBP или HEIC, каждое до 8 МБ."); setFiles([]); } else { setFileError(""); setFiles(list); } }} /><span><b>{files.length ? `Выбрано фото: ${files.length}` : "Добавить фотографии"}</b><small>До 5 фото, каждое до 8 МБ · необязательно</small></span></label>
        {fileError && <p className="form-message error" role="alert">{fileError}</p>}
        {files.length > 0 && <button type="button" className="remove-files" onClick={() => setFiles([])}>Убрать выбранные фото</button>}
        <label className="consent"><input ref={consentRef} type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required /><span>Согласен на обработку данных для оформления заявки. <Link href="/privacy" target="_blank">Политика конфиденциальности</Link>.</span></label>
      </>}
      {step > 0 && <button className="back-step" type="button" disabled={isSubmitting} onClick={() => moveTo(step - 1)}>Назад</button>}
      </div></MotionPanel></fieldset>
    </form>
    <aside className="booking-summary">
      <div className="summary-inner">
        <div className="summary-heading"><span>Ваш расчёт</span><span className="summary-city">{city}</span></div>
        <div className="summary-price"><strong><PriceAmount amount={quote.total} /></strong></div><p className="summary-subtitle">Предварительная стоимость</p>
        <MotionPanel transitionKey={`${input.extras.join("-")}-${input.condition}-${input.frequency}-${input.bathrooms}-${quote.base === pricing[input.service].minimum}`} animateContent={false}><dl className="summary-lines">
          <div><dt>{pricing[input.service].label} · {input.area} м²</dt><dd>{money(quote.base)} ₽</dd></div>
          {quote.base === pricing[input.service].minimum && <div className="summary-hint"><dt>Минимум заказа для этого типа уборки</dt></div>}
          <div><dt>Санузлы · {input.bathrooms}</dt><dd>{quote.bathrooms ? `+${money(quote.bathrooms)} ₽` : "включено"}</dd></div>
          {quote.condition > 0 && <div><dt>Состояние · {input.condition === "dirty" ? "+18%" : "+35%"}</dt><dd>+{money(quote.condition)} ₽</dd></div>}
          {extraKeys.filter(key => counts[key] > 0).map(key => <div key={key}><dt>{extrasCatalog[key].label} × {counts[key]}</dt><dd>+{money(extrasCatalog[key].price * counts[key])} ₽</dd></div>)}
          {quote.discount > 0 && <div className="summary-discount"><dt>Регулярная уборка · {input.frequency === "weekly" ? "−15%" : "−10%"}</dt><dd>−{money(quote.discount)} ₽</dd></div>}
        </dl></MotionPanel>
        <div className="summary-included"><span>✓ Средства и инвентарь</span><span>✓ Один санузел и кухня</span></div>
        <p className="summary-timing">Ориентир: {quote.duration.toLocaleString("ru-RU")}–{(quote.duration + 1).toLocaleString("ru-RU")} ч · {quote.crew === 1 ? "1 сотрудник" : "2 сотрудника"}</p>
        <p className="summary-disclaimer">Стоимость и время согласуем до выезда. Сложные загрязнения оценим по фото.</p>
        {pricingStatus === "error" && <p className="form-message error" role="alert">Тарифы пока не загрузились. Показан базовый расчёт. <button type="button" onClick={refreshPricing}>Обновить тарифы</button></p>}
        <div className={`booking-action ${calculatorVisible ? "mobile-docked" : ""}`}>
          <div className="mobile-price"><small>Предварительно</small><b><PriceAmount amount={quote.total} /></b></div>
          <button type="submit" form="order-form" className="button" disabled={isSubmitting || pricingStatus === "loading" || (step === 2 && (isPreviewDeployment || pricingStatus !== "ready"))}>{isSubmitting ? "Отправляем…" : pricingStatus === "loading" ? "Загружаем тарифы…" : step < 2 ? "Далее" : isPreviewDeployment ? "Демо · без отправки" : "Отправить заявку"}{isSubmitting && <span className="button-spinner" aria-hidden="true" />}</button>
          {error && <p className="form-message error booking-error" role="alert">{error}</p>}
        </div>
        <p className="summary-safe">{isPreviewDeployment ? "Демонстрация: можно рассчитать стоимость, но не отправить заявку." : step < 2 ? "Цена видна сразу. Телефон — на последнем шаге." : "Без онлайн-оплаты. Вы подтверждаете заказ после связи с менеджером."}</p>
      </div>
    </aside>
  </div>;
}
