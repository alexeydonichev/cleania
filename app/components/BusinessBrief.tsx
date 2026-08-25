"use client";

import { FormEvent, useState } from "react";

export default function BusinessBrief() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/business-leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error || "Не удалось отправить заявку");
      setState("success");
      setMessage(
        "Бриф отправлен. Менеджер подготовит вопросы для точной сметы.",
      );
      event.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Не удалось отправить заявку",
      );
    }
  }
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
            max="50000"
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
        <input type="checkbox" name="consent" defaultChecked required />
        <span>Согласен на обработку данных для подготовки предложения</span>
      </label>
      {message && (
        <p
          className={`form-message ${state === "success" ? "success" : "error"}`}
          role="status"
        >
          {message}
        </p>
      )}
      <button className="button" disabled={state === "sending"}>
        {state === "sending" ? "Отправляем…" : "Получить расчёт"} <span>→</span>
      </button>
    </form>
  );
}
