"use client";

import { FormEvent, useState } from "react";
import { isPreviewDeployment } from "@/lib/deployment";
import ContactLinks from "./ContactLinks";

export default function BusinessBrief() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [messengerFallback, setMessengerFallback] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPreviewDeployment) return;
    setState("sending");
    setMessage("");
    setMessengerFallback("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const requestForMessenger = [
      "Здравствуйте! Хочу запросить смету на уборку для бизнеса.",
      `Объект: ${String(payload.objectType || "не указан")}`,
      `Площадь: ${String(payload.area || "не указана")} м²`,
      `График: ${String(payload.schedule || "не указан")}`,
      `Контакт: ${String(payload.name || "не указан")}, ${String(payload.phone || "не указан")}`,
      payload.comment ? `Комментарий: ${String(payload.comment)}` : "",
      "Прошу уточнить состав работ, стоимость и свободное время.",
    ].filter(Boolean).join("\n");
    try {
      const response = await fetch("/api/business-leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        if (response.status === 503) setMessengerFallback(requestForMessenger);
        throw new Error(result.error || "Не удалось отправить заявку");
      }
      setState("success");
      setMessage(
        "Бриф отправлен. Менеджер подготовит вопросы для точной сметы.",
      );
      formElement.reset();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Не удалось отправить заявку",
      );
    }
  }
  if (isPreviewDeployment) return <div className="business-form preview-card">
    <p className="eyebrow">Демонстрационная версия</p><h2>Начните с расчёта</h2>
    <p>В калькуляторе можно выбрать офис, площадь и дополнительные работы. Отправку брифа подключим вместе с базой заявок. Сейчас личные данные не запрашиваем.</p>
    <a className="button" href="/?service=office#calculator">Рассчитать уборку офиса</a>
    <ContactLinks />
  </div>;
  return (
    <form className="business-form" onSubmit={submit}>
      <div className="business-form-head">
        <span>Короткий бриф</span>
        <b>≈ 2 минуты</b>
      </div>
      <div className="business-fields">
        <label>
          <span>Тип объекта</span>
          <select name="objectType" required defaultValue="">
            <option value="" disabled>
              Выберите
            </option>
            <option>Офис</option>
            <option>Магазин</option>
            <option>Клиника</option>
            <option>Ресторан / кафе</option>
            <option>Склад</option>
            <option>Другое</option>
          </select>
        </label>
        <label>
          <span>Площадь, м²</span>
          <input
            name="area"
            type="number"
            min="20"
            max="4000"
            required
            placeholder="450"
          />
        </label>
        <label>
          <span>График</span>
          <select name="schedule" required defaultValue="">
            <option value="" disabled>
              Выберите
            </option>
            <option>Ежедневно</option>
            <option>2–3 раза в неделю</option>
            <option>Раз в неделю</option>
            <option>Разовая уборка</option>
          </select>
        </label>
        <label>
          <span>Имя</span>
          <input
            name="name"
            autoComplete="name"
            required
            placeholder="Алексей"
          />
        </label>
        <label>
          <span>Телефон</span>
          <input
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="+7 999 000-00-00"
          />
        </label>
        <label>
          <span>Комментарий</span>
          <input name="comment" placeholder="Ночная смена, пропускной режим…" />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>Согласен на обработку данных для подготовки предложения. <a href="/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>.</span>
      </label>
      {message && (
        <p
          className={`form-message ${state === "success" ? "success" : "error"}`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      {state === "error" && messengerFallback && (
        <div className="business-messenger-fallback">
          <p>Готовый запрос можно передать напрямую — данные уже добавлены в сообщение.</p>
          <ContactLinks showPhone={false} message={messengerFallback} />
        </div>
      )}
      <button className="button" disabled={state === "sending"}>
        {state === "sending" ? "Отправляем…" : "Запросить смету"}
      </button>
    </form>
  );
}
