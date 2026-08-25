"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

const slides = [
  {
    label: "Квартира",
    title: "Расчёт виден до заявки",
    text: "Площадь, санузлы, состояние, регулярность и допработы сразу собираются в понятную цену.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1800&q=88",
    stat: "2 мин",
    statLabel: "до заявки",
  },
  {
    label: "Генеральная",
    title: "Чек-лист вместо обещаний",
    text: "Клиент понимает состав работ заранее, а менеджер видит заказ, фото и комментарии в CRM.",
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1800&q=88",
    stat: "32",
    statLabel: "точки контроля",
  },
  {
    label: "После ремонта",
    title: "Сложность считается честно",
    text: "После ремонта, окна, техника и шкафы не прячутся в доплаты после выезда.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=88",
    stat: "до 5",
    statLabel: "фото объекта",
  },
  {
    label: "Офис",
    title: "Объекты идут в CRM",
    text: "Заявки, смены, расходы и прибыль собираются в одном рабочем контуре.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=88",
    stat: "SLA",
    statLabel: "для бизнеса",
  },
];

export default function HeroShowcase() {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className="hero hero-showcase"
      aria-label="Cleania: онлайн-заказ уборки"
    >
      <Image
        key={slide.image}
        className="hero-bg"
        src={slide.image}
        alt=""
        width="1800"
        height="1200"
        priority
      />
      <div className="hero-scrim" />
      <div className="hero-content shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Онлайн-клининг с CRM внутри
          </p>
          <h1>
            Cleania: уборка, которую видно до заказа
          </h1>
          <p className="hero-lead">
            Клиент считает стоимость, выбирает дату, прикрепляет фото и
            отправляет заявку. Команда получает заказ сразу, без ручной
            переписки и потерянных лидов.
          </p>
          <div className="hero-actions">
            <Link className="button" href="#calculator">
              Рассчитать стоимость <span aria-hidden="true">↘</span>
            </Link>
            <Link className="ghost-button" href="/crm">
              Открыть CRM
            </Link>
          </div>
        </div>

        <div className="hero-live-panel" aria-live="polite">
          <div className="hero-live-top">
            <span>{slide.label}</span>
            <div className="hero-top-actions">
              <b>
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </b>
              <div className="hero-controls" aria-label="Переключить слайд">
                {slides.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={`Показать слайд ${index + 1}: ${item.label}`}
                    aria-pressed={active === index}
                    onClick={() => setActive(index)}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <h2>{slide.title}</h2>
          <p>{slide.text}</p>
          <div className="hero-live-bottom">
            <div>
              <strong>{slide.stat}</strong>
              <small>{slide.statLabel}</small>
            </div>
          </div>
          <div
            className="hero-progress"
            style={
              {
                "--hero-progress": `${((active + 1) / slides.length) * 100}%`,
              } as CSSProperties
            }
          />
        </div>
      </div>
    </section>
  );
}
