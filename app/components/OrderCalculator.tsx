"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ServiceKey = "regular" | "deep" | "renovation" | "office";
type ExtraKey =
  | "windows"
  | "oven"
  | "fridge"
  | "balcony"
  | "cabinets"
  | "ironing";

const services: Record<
  ServiceKey,
  { label: string; rate: number; minimum: number }
> = {
  regular: { label: "Поддерживающая", rate: 95, minimum: 2490 },
  deep: { label: "Генеральная", rate: 160, minimum: 4490 },
  renovation: { label: "После ремонта", rate: 230, minimum: 6990 },
  office: { label: "Офис", rate: 110, minimum: 5990 },
};

const extras: Record<ExtraKey, { label: string; price: number }> = {
  windows: { label: "Окна", price: 1200 },
  oven: { label: "Духовка", price: 650 },
  fridge: { label: "Холодильник", price: 650 },
  balcony: { label: "Балкон", price: 900 },
  cabinets: { label: "Внутри шкафов", price: 950 },
  ironing: { label: "Глажка, 1 час", price: 700 },
};

const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export default function OrderCalculator() {
  const [service, setService] = useState<ServiceKey>("regular");
  const [pricing, setPricing] = useState(services);
  const [area, setArea] = useState(48);
  const [bathrooms, setBathrooms] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<ExtraKey[]>([]);
  const [condition, setCondition] = useState<"normal" | "dirty" | "very_dirty">(
    "normal",
  );
  const [frequency, setFrequency] = useState<"once" | "weekly" | "biweekly">(
    "once",
  );
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setIsReady(true), 0);
    return () => window.clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    fetch("/api/pricing")
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          data: {
            rules?: Array<{
              key: ServiceKey;
              label: string;
              rate: number;
              minimum: number;
            }>;
          } | null,
        ) => {
          if (!data?.rules?.length) return;
          setPricing((current) => ({
            ...current,
            ...Object.fromEntries(
              data.rules.map((rule) => [
                rule.key,
                {
                  label: rule.label,
                  rate: Number(rule.rate),
                  minimum: Number(rule.minimum),
                },
              ]),
            ),
          }));
        },
      )
      .catch(() => undefined);
  }, []);

  const estimate = useMemo(() => {
    const item = pricing[service];
    const areaPrice = Math.max(item.minimum, area * item.rate);
    const bathroomsPrice = Math.max(0, bathrooms - 1) * 550;
    const extrasPrice = selectedExtras.reduce(
      (sum, key) => sum + extras[key].price,
      0,
    );
    const conditionMultiplier =
      condition === "very_dirty" ? 1.35 : condition === "dirty" ? 1.18 : 1;
    const frequencyDiscount =
      frequency === "weekly" ? 0.85 : frequency === "biweekly" ? 0.9 : 1;
    const total =
      Math.round(
        (((areaPrice + bathroomsPrice) * conditionMultiplier + extrasPrice) *
          frequencyDiscount) /
          50,
      ) * 50;
    const hours = Math.max(
      2,
      Math.round(
        (area / (service === "renovation" ? 12 : 18) +
          selectedExtras.length * 0.35) *
          2,
      ) / 2,
    );
    const crew = area >= 80 || service === "renovation" ? 2 : 1;
    return { total, hours, crew };
  }, [area, bathrooms, condition, frequency, selectedExtras, service, pricing]);

  function toggleExtra(key: ExtraKey) {
    setSelectedExtras((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    const phoneIsValid = phone.replace(/\D/g, "").length >= 10;
    if (!name.trim() || !phoneIsValid || !consent) {
      setResult({
        ok: false,
        message: "Укажите имя, корректный телефон и подтвердите согласие.",
      });
      window.requestAnimationFrame(() => {
        if (!name.trim()) nameRef.current?.focus();
        else if (!phoneIsValid) phoneRef.current?.focus();
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          service,
          area,
          bathrooms,
          extras: selectedExtras,
          condition,
          frequency,
          preferredDate: date || null,
          name: name.trim(),
          phone: phone.trim(),
          consent,
        }),
      });
      const data = (await response.json()) as {
        orderNumber?: string;
        uploadToken?: string;
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error || "Не удалось отправить заявку");
      if (files.length && data.orderNumber && data.uploadToken) {
        const upload = new FormData();
        files.forEach((file) => upload.append("files", file));
        const uploadResponse = await fetch(
          `/api/orders/${data.orderNumber}/files`,
          {
            method: "POST",
            headers: { "x-upload-token": data.uploadToken },
            body: upload,
          },
        );
        if (!uploadResponse.ok)
          throw new Error(
            "Заявка создана, но фотографии не загрузились. Мы уточним детали при подтверждении.",
          );
      }
      setResult({
        ok: true,
        message: `Заявка ${data.orderNumber} создана. Мы подтвердим детали в мессенджере или по телефону.`,
      });
    } catch (error) {
      setResult({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Не удалось отправить заявку",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="calculator-card">
      <form
        className="calculator-form"
        id="order-form"
        noValidate={isReady}
        onSubmit={submitOrder}
      >
        <fieldset className="calculator-group">
          <legend>
            <span>01</span> Что нужно убрать?
          </legend>
          <div className="choice-grid service-choices">
            {(Object.keys(services) as ServiceKey[]).map((key) => (
              <label
                className={
                  service === key ? "choice-card active" : "choice-card"
                }
                key={key}
              >
                <input
                  type="radio"
                  name="service"
                  value={key}
                  checked={service === key}
                  onChange={() => setService(key)}
                />
                <span>{pricing[key].label}</span>
                <small>от {money.format(pricing[key].minimum)} ₽</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="calculator-group two-column-group">
          <legend>
            <span>02</span> Объём и состояние
          </legend>
          <label className="range-field">
            <span>
              Площадь <b>{area} м²</b>
            </span>
            <input
              type="range"
              min="20"
              max="300"
              step="1"
              value={area}
              onChange={(event) => setArea(Number(event.target.value))}
            />
            <small>
              <span>20 м²</span>
              <span>300 м²</span>
            </small>
          </label>
          <label className="select-field">
            <span>Санузлы</span>
            <select
              value={bathrooms}
              onChange={(event) => setBathrooms(Number(event.target.value))}
            >
              <option value="1">1 санузел</option>
              <option value="2">2 санузла</option>
              <option value="3">3 санузла</option>
              <option value="4">4+ санузла</option>
            </select>
          </label>
          <label className="select-field">
            <span>Состояние</span>
            <select
              value={condition}
              onChange={(event) =>
                setCondition(event.target.value as typeof condition)
              }
            >
              <option value="normal">Обычное</option>
              <option value="dirty">Давно не убирали</option>
              <option value="very_dirty">Сильные загрязнения</option>
            </select>
          </label>
          <label className="select-field">
            <span>Регулярность</span>
            <select
              value={frequency}
              onChange={(event) =>
                setFrequency(event.target.value as typeof frequency)
              }
            >
              <option value="once">Один раз</option>
              <option value="weekly">Каждую неделю — скидка 15%</option>
              <option value="biweekly">Раз в 2 недели — скидка 10%</option>
            </select>
          </label>
        </fieldset>

        <fieldset className="calculator-group">
          <legend>
            <span>03</span> Добавить задачи
          </legend>
          <div className="extras-grid">
            {(Object.keys(extras) as ExtraKey[]).map((key) => (
              <label
                className={
                  selectedExtras.includes(key)
                    ? "extra-choice active"
                    : "extra-choice"
                }
                key={key}
              >
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(key)}
                  onChange={() => toggleExtra(key)}
                />
                <span>{extras[key].label}</span>
                <b>+{money.format(extras[key].price)} ₽</b>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="calculator-group contact-group">
          <legend>
            <span>04</span> Куда прислать подтверждение?
          </legend>
          <div className="contact-grid">
            <label>
              <span>Ваше имя</span>
              <input
                ref={nameRef}
                autoComplete="name"
                name="customerName"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Алексей"
              />
            </label>
            <label>
              <span>Телефон</span>
              <input
                ref={phoneRef}
                autoComplete="tel"
                inputMode="tel"
                name="customerPhone"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 999 000-00-00"
                title="Укажите номер телефона минимум из 10 цифр"
              />
            </label>
            <label>
              <span>Желаемая дата</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
          </div>
          <label className="file-field">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.target.files || []).slice(0, 5))
              }
            />
            <span>
              <b>
                {files.length
                  ? `Выбрано фото: ${files.length}`
                  : "Добавить фото объекта"}
              </b>
              <small>До 5 файлов · JPG, PNG, WEBP или HEIC</small>
            </span>
          </label>
          <label className="consent">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>Согласен на обработку данных для оформления заказа</span>
          </label>
          {result && (
            <p
              className={
                result.ok ? "form-message success" : "form-message error"
              }
              role="status"
            >
              {result.message}
            </p>
          )}
        </fieldset>
      </form>

      <aside className="estimate-panel" aria-live="polite">
        <div className="estimate-sticky">
          <p className="estimate-label">Предварительная стоимость</p>
          <strong className="estimate-price">
            {money.format(estimate.total)} <small>₽</small>
          </strong>
          <p className="estimate-caption">
            Цена фиксируется после подтверждения деталей. Для сложных объектов
            уточним диапазон по фото.
          </p>
          <dl className="estimate-list">
            <div>
              <dt>
                {pricing[service].label}, {area} м²
              </dt>
              <dd>включено</dd>
            </div>
            <div>
              <dt>Санузлы</dt>
              <dd>{bathrooms}</dd>
            </div>
            <div>
              <dt>Дополнительные задачи</dt>
              <dd>{selectedExtras.length || "—"}</dd>
            </div>
            <div>
              <dt>Исполнители</dt>
              <dd>{estimate.crew}</dd>
            </div>
            <div>
              <dt>Ориентир по времени</dt>
              <dd>{estimate.hours} ч</dd>
            </div>
          </dl>
          <button
            className="button estimate-button"
            type="submit"
            form="order-form"
            disabled={!isReady || isSubmitting}
          >
            {!isReady
              ? "Подключаем форму…"
              : isSubmitting
                ? "Создаём заявку…"
                : "Оформить за 2 минуты"}{" "}
            <span aria-hidden="true">→</span>
          </button>
          {result && (
            <p
              className={`form-message estimate-result ${
                result.ok ? "success" : "error"
              }`}
            >
              {result.message}
            </p>
          )}
          <p className="estimate-safe">
            <span>✓</span> Оплата после уборки · чек на почту
          </p>
        </div>
      </aside>
    </div>
  );
}
