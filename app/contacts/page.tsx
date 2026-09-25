import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";
import ContactLinks from "@/app/components/ContactLinks";

export const metadata: Metadata = {
  title: "Контакты и зона работы",
  description:
    "БлескПРО в Новосибирске и Бердске: расчёт уборки, телефон, Telegram, MAX и зона обслуживания.",
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <main>
      <PublicHeader />
      <section className="inner-title shell">
        <p className="eyebrow">
          <span /> На связи
        </p>
        <h1>
          Контакты
          <br />
          <em>БлескПРО</em>
        </h1>
        <p>
          Работаем в Новосибирске и Бердске. Позвоните или напишите нам —
          обсудим уборку, адрес и удобное время.
        </p>
      </section>
      <section className="section shell contacts-grid">
        <div className="contact-card">
          <h2>Заказать уборку</h2>
          <p>
            Рассчитайте стоимость и напишите нам для согласования деталей. Сообщение отправляете вы — чат не создаёт заказ автоматически.
          </p>
          <ContactLinks />
          <a className="button" href="/#calculator">
            Открыть калькулятор
          </a>
        </div>
        <div className="contact-card">
          <h2>Для бизнеса</h2>
          <p>Опишите объект и график — подготовим вопросы для точной сметы.</p>
          <a className="text-link" href="/business">
            Заполнить бриф
          </a>
        </div>
        <div className="contact-card">
          <h2>Зона работы</h2>
          <p>
            Новосибирск, Академгородок и Бердск. Конкретный адрес, время и выезд за границы городов подтверждаем до заказа.
          </p>
          <span className="zone-tag">Новосибирск · Бердск</span>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
