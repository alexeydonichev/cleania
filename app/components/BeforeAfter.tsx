"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useBooking } from "./BookingProvider";
import type { ServiceKey } from "@/lib/quote";

const examples: Array<{ id: string; label: string; title: string; before: string; after: string; tasks: string[]; service: ServiceKey }> = [
  {
    id: "kitchen", label: "Квартира", title: "Кухня без следов готовки",
    before: "Жир на фартуке, крошки и следы на фасадах.",
    after: "Чистые рабочие поверхности, плита и фасады.",
    tasks: ["Удаление жира с фартука и плиты", "Мытьё фасадов снаружи", "Очистка раковины и смесителя", "Мытьё пола и плинтусов"], service: "deep",
  },
  {
    id: "office", label: "Офис", title: "Рабочее место — в порядке",
    before: "Пыль на столах, следы чашек и обуви на полу.",
    after: "Чистые столы, кресла и пол без следов обуви.",
    tasks: ["Обеспыливание доступных поверхностей", "Аккуратный уход за рабочими столами", "Очистка плинтусов", "Влажная уборка пола"], service: "office",
  },
  {
    id: "bathroom", label: "Санузел", title: "Стекло, которое снова прозрачно",
    before: "Мыльные разводы и известковый налёт на стекле и сантехнике.",
    after: "Прозрачное стекло, чистая раковина и смеситель.",
    tasks: ["Удаление подходящим средством известкового налёта", "Очистка душевого стекла", "Мытьё раковины и смесителя", "Мытьё плитки и пола"], service: "deep",
  },
];

export default function BeforeAfter() {
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(50);
  const [loaded, setLoaded] = useState({ id: examples[0].id, before: false, after: false });
  const [failed, setFailed] = useState(false);
  const { update } = useBooking();
  const instance = useId();
  const example = examples[active];
  const ready = loaded.id === example.id && loaded.before && loaded.after;

  function markLoaded(id: string, side: "before" | "after") {
    // An old image can finish after the visitor has already changed the tab.
    setLoaded(value => value.id === id ? { ...value, [side]: true } : value);
  }

  function select(index: number) {
    if (index === active) return;
    setActive(index); setPosition(50); setLoaded({ id: examples[index].id, before: false, after: false }); setFailed(false);
  }

  return <section className="case-section shell section" id="work" aria-labelledby="cases-title">
    <div className="section-heading home-heading compact-heading">
      <div><p className="eyebrow">Демонстрационные примеры</p><h2 id="cases-title">До уборки. <span>И после.</span></h2></div>
      <p>Передвиньте разделитель и сравните поверхности. Один ракурс помогает увидеть, что именно изменилось.</p>
    </div>
    <div className="case-tabs" role="tablist" aria-label="Примеры помещений">
      {examples.map((item, index) => <button key={item.id} type="button" role="tab" id={`${instance}-tab-${index}`} aria-controls={`${instance}-panel`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (active + (event.key === "ArrowRight" ? 1 : 2)) % examples.length;
        select(next); document.getElementById(`${instance}-tab-${next}`)?.focus();
      }}>{item.label}</button>)}
    </div>
    <div className="case-panel" role="tabpanel" id={`${instance}-panel`} aria-labelledby={`${instance}-tab-${active}`}>
      <div className="case-comparison">
        <div className="compare-stage" aria-busy={!ready && !failed}>
          <Image key={`${example.id}-after`} src={`/images/cases/${example.id}-after.webp`} alt={`После уборки — ${example.after} ИИ-визуализация.`} fill sizes="(max-width: 850px) 93vw, 65vw" onLoad={() => markLoaded(example.id, "after")} onError={() => setFailed(true)} />
          <div className="compare-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
            <Image key={`${example.id}-before`} src={`/images/cases/${example.id}-before.webp`} alt={`До уборки — ${example.before} ИИ-визуализация.`} fill sizes="(max-width: 850px) 93vw, 65vw" onLoad={() => markLoaded(example.id, "before")} onError={() => setFailed(true)} />
          </div>
          {!ready && <div className="compare-loading" role="status">{failed ? "Изображения не загрузились. Обновите страницу." : "Загружаем сравнение…"}</div>}
          <span className="compare-label compare-label-before" aria-hidden="true">До</span><span className="compare-label compare-label-after" aria-hidden="true">После</span>
          <div className="compare-divider" style={{ left: `${position}%` }} aria-hidden="true"><span><i /><i /></span></div>
          <input className="compare-slider" type="range" min={0} max={100} step={1} value={position} disabled={!ready || failed} aria-label={`Сравнение до и после: ${example.label}`} aria-valuetext={`До — ${position} процентов изображения, после — ${100 - position} процентов`} onChange={event => setPosition(Number(event.target.value))} />
        </div>
        <div className="compare-controls"><button type="button" disabled={!ready || failed} onClick={() => setPosition(100)}>Показать до</button><span>Потяните разделитель</span><button type="button" disabled={!ready || failed} onClick={() => setPosition(0)}>Показать после</button></div>
      </div>
      <div className="case-description">
        <p className="case-type">Типовая задача · {example.label}</p><h3>{example.title}</h3>
        <dl><div><dt>До</dt><dd>{example.before}</dd></div><div><dt>После</dt><dd>{example.after}</dd></div></dl>
        <h4>Что входит в такую работу</h4><ul>{example.tasks.map(task => <li key={task}>{task}</li>)}</ul>
        <a className="button" href="#calculator" onClick={() => update({ service: example.service })}>Рассчитать такую уборку</a>
      </div>
    </div>
  </section>;
}
