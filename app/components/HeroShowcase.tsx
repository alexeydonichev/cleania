"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useBooking } from "./BookingProvider";
import { money, serviceKeys, type ServiceKey } from "@/lib/quote";

export default function HeroShowcase() {
  const { input, update, pricing, quote } = useBooking();
  const [areaDraft, setAreaDraft] = useState(String(input.area));
  const [lastArea, setLastArea] = useState(input.area);
  if (lastArea !== input.area) { setLastArea(input.area); setAreaDraft(String(input.area)); }
  return (
    <section className="home-hero shell" aria-labelledby="hero-title">
      <div className="hero-title-row">
        <div><p className="eyebrow">Клининг в Новосибирске и Бердске</p><h1 id="hero-title">Дома — чисто.<br /><span>А время — ваше.</span></h1></div>
        <div className="hero-aside"><span className="hero-spark" aria-hidden="true">✳</span><p>Уборку возьмём на себя. Выберите, как провести освободившийся день.</p><Link href="#calculator" className="text-link">Рассчитать мою уборку <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="home-hero-photo">
        <Image src="/images/cleania-home.webp" alt="Светлая уютная гостиная с голубым диваном" width={1672} height={941} priority sizes="(max-width: 700px) 100vw, 95vw" />
        <span className="photo-note">Меньше быта. Больше жизни.</span>
        <div className="quick-quote">
          <div className="quick-quote-head"><span>Сколько стоит ваша уборка?</span><span aria-hidden="true">↘</span></div>
          <div className="quick-quote-fields">
            <label><span>Тип уборки</span><select aria-label="Тип уборки — быстрый расчёт" value={input.service} onChange={e => update({ service: e.target.value as ServiceKey })}>{serviceKeys.map(key => <option value={key} key={key}>{pricing[key].label}</option>)}</select></label>
            <label><span>Площадь, м²</span><input aria-label="Площадь — быстрый расчёт" type="number" min={20} max={300} step={1} value={areaDraft} onChange={e => { setAreaDraft(e.target.value); const value = Number(e.target.value); if (Number.isInteger(value) && value >= 20 && value <= 300) update({ area: value }); }} onBlur={() => { const value = Math.max(20, Math.min(300, Math.round(Number(areaDraft) || input.area))); update({ area: value }); setAreaDraft(String(value)); }} /></label>
          </div>
          <div className="quick-quote-bottom"><div><small>Предварительно</small><strong aria-live="polite">{money(quote.total)} ₽</strong></div><Link href="#calculator" aria-label="Настроить уборку в калькуляторе">Настроить <span aria-hidden="true">↗</span></Link></div>
        </div>
        <span className="photo-caption">Всё для уютного возвращения домой</span>
      </div>
      <div className="hero-benefits"><span><b>01</b> Расчёт без номера телефона</span><span><b>02</b> Средства и инвентарь с собой</span><span><b>03</b> Состав работ до подтверждения</span></div>
    </section>
  );
}
