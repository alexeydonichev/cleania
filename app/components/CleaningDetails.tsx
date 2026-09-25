"use client";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import MotionPanel from "./MotionPanel";
import { useBooking } from "./BookingProvider";
import { money, type ServiceKey } from "@/lib/quote";

const services: { key: ServiceKey; title: string; text: string; points: string[]; href: string }[] = [
  { key: "regular", title: "Поддержать\nчистоту", text: "Когда дома нужен привычный порядок.", points: ["Пыль, полы и зеркала", "Кухня и санузел", "Можно по расписанию"], href: "/services/regular-cleaning" },
  { key: "deep", title: "Убрать\nосновательно", text: "Когда хочется свежести в каждой детали.", points: ["Всё из поддерживающей", "Налёт и кухонный жир", "Двери, плинтусы, радиаторы"], href: "/services/deep-cleaning" },
  { key: "renovation", title: "Заехать\nпосле ремонта", text: "Когда ремонт закончился, а пыль осталась.", points: ["Строительная пыль", "Следы скотча и смесей", "Полы в несколько проходов"], href: "/services/after-renovation" },
];
export function ServiceOverview() {
  const { pricing, update } = useBooking();
  return <div className="home-services">{services.map((s,i) => <article className={i === 1 ? "home-service featured" : "home-service"} key={s.key}>
    <div className="service-card-top"><span>0{i + 1}</span><span>{i === 1 ? "Генеральная" : pricing[s.key].label}</span></div>
    <h3>{s.title.split("\n").map((line,j) => <span key={line}>{j > 0 && <br />}{line}</span>)}</h3><p>{s.text}</p>
    <ul>{s.points.map(point => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}</ul>
    <div className="service-price"><span>от <strong>{money(pricing[s.key].minimum)} ₽</strong></span><small>{pricing[s.key].rate} ₽/м² · минимум заказа</small></div>
    <div className="service-links"><a href="#calculator" onClick={() => update({ service: s.key })}>Рассчитать</a><Link href={s.href}>Подробнее</Link></div>
  </article>)}</div>;
}
const rooms = ["Комнаты", "Кухня", "Санузел"] as const;
const basic = [
  ["Протираем доступные поверхности", "Пылесосим ковры", "Моем полы и плинтусы", "Протираем зеркала", "Выносим бытовой мусор"],
  ["Моем столешницу и фартук", "Протираем фасады снаружи", "Моем раковину и смеситель", "Очищаем плиту снаружи", "Моем пол"],
  ["Моем ванну или душевую", "Чистим унитаз и раковину", "Протираем зеркала и смесители", "Моем пол", "Выносим мусор"],
];
export function CleaningDetails() {
  const [room, setRoom] = useState(0);
  const [direction, setDirection] = useState(1);
  function selectRoom(next: number) { if (next !== room) { setDirection(next > room ? 1 : -1); setRoom(next); } }
  const { input, pricing } = useBooking();
  const list = [...basic[room]];
  if (input.service === "deep") list.push(room === 0 ? "Детально моем двери и радиаторы" : room === 1 ? "Удаляем стойкий жир на доступных поверхностях" : "Удаляем известковый налёт");
  if (input.service === "renovation") list.push("Удаляем строительную пыль и локальные следы ремонта");
  return <div className="checklist-layout"><div className="checklist-intro"><span className="checklist-symbol" aria-hidden="true">✳</span><h3>{input.service === "office" ? "Уборка офиса" : input.service === "renovation" ? "Уборка после ремонта" : `${pricing[input.service].label} уборка`}</h3><p>Состав зависит от выбранного типа уборки. Деликатные материалы и сложные загрязнения обсудим заранее.</p><a className="text-link" href="#calculator">Изменить тип уборки</a></div><div className="checklist-content"><div className="room-tabs" style={{ "--active-room": room } as CSSProperties} role="tablist" aria-label="Зона уборки">{rooms.map((r,i) => <button type="button" key={r} role="tab" id={`room-tab-${i}`} aria-controls="room-panel" aria-selected={room === i} tabIndex={room === i ? 0 : -1} onClick={() => selectRoom(i)} onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) { e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? 2 : (room + (e.key === "ArrowRight" ? 1 : 2)) % 3; selectRoom(next); document.getElementById(`room-tab-${next}`)?.focus(); } }}>{r}</button>)}</div><MotionPanel transitionKey={`${room}-${input.service}`} direction={direction}><div role="tabpanel" id="room-panel" tabIndex={0} aria-labelledby={`room-tab-${room}`}><ul>{list.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></div></MotionPanel><p className="checklist-note">Отдельно: окна, техника и шкафы внутри, балкон, глажка. Выберите их в калькуляторе.</p></div></div>;
}
