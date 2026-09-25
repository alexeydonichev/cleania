"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useBooking } from "./BookingProvider";
import { serviceKeys, type ServiceKey } from "@/lib/quote";
import PriceAmount from "./PriceAmount";
import CleaningSpark from "./CleaningSpark";
import ContactLinks from "./ContactLinks";

export default function HeroShowcase() {
  const { input, update, pricing, quote } = useBooking();
  const [areaDraft, setAreaDraft] = useState(String(input.area));
  const [lastArea, setLastArea] = useState(input.area);
  if (lastArea !== input.area) { setLastArea(input.area); setAreaDraft(String(input.area)); }
  return (
    <section className="home-hero shell" aria-labelledby="hero-title">
      <div className="hero-title-row">
        <div><p className="eyebrow">Клининг в Новосибирске и Бердске</p><h1 id="hero-title"><span className="hero-line"><span>Работу — нам,</span></span>{" "}<span className="hero-line hero-line-accent"><span>а отдых — Вам</span></span></h1></div>
        <div className="hero-aside"><CleaningSpark /><p>Уборку возьмём на себя. Выберите, как провести освободившийся день.</p><Link href="#calculator" className="text-link">Рассчитать мою уборку</Link></div>
      </div>
      <div className="home-hero-photo">
        <Image src="/images/cleania-home-retouched.webp" alt="Светлая уютная гостиная с голубым диваном" width={1672} height={941} priority sizes="(max-width: 700px) 100vw, 95vw" />
        <span className="photo-note">Меньше быта. Больше жизни.</span>
        <div className="quick-quote">
          <div className="quick-quote-head">Сколько стоит ваша уборка?</div>
          <div className="quick-quote-fields">
            <label><span>Тип уборки</span><select aria-label="Тип уборки — быстрый расчёт" value={input.service} onChange={e => update({ service: e.target.value as ServiceKey })}>{serviceKeys.map(key => <option value={key} key={key}>{pricing[key].label}</option>)}</select></label>
            <label><span>Площадь, м²</span><input aria-label="Площадь — быстрый расчёт" type="number" min={20} max={300} step={1} value={areaDraft} onChange={e => { setAreaDraft(e.target.value); const value = Number(e.target.value); if (Number.isInteger(value) && value >= 20 && value <= 300) update({ area: value }); }} onBlur={() => { const value = Math.max(20, Math.min(300, Math.round(Number(areaDraft) || input.area))); update({ area: value }); setAreaDraft(String(value)); }} /></label>
          </div>
          <div className="quick-quote-bottom"><div><small>Предварительно</small><strong><PriceAmount amount={quote.total} /></strong></div><Link href="#calculator" aria-label="Настроить уборку в калькуляторе">Настроить</Link></div>
        </div>
        <span className="photo-caption">Всё для уютного возвращения домой</span>
      </div>
      <div className="hero-benefits"><span><b>01</b> Расчёт без номера телефона</span><span><b>02</b> Средства и инвентарь с собой</span><span><b>03</b> Состав работ до подтверждения</span></div>
      <div className="quick-contact"><p>Есть вопросы? Обсудим уборку напрямую.</p><ContactLinks /></div>
    </section>
  );
}
