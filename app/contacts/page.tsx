import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";

export const metadata: Metadata = {
  title: "Контакты и зона работы",
  description:
    "Cleania в Новосибирске и Бердске: онлайн-заказ уборки, зона обслуживания и способы связи.",
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
          <em>Cleania</em>
        </h1>
        <p>
          Работаем в Новосибирске и Бердске. Оставьте заявку с вашим номером —
          свяжемся, чтобы обсудить уборку, адрес и удобное время.
        </p>
      </section>
      <section className="section shell contacts-grid">
        <div className="contact-card">
          <span>01</span>
          <h2>Заказать уборку</h2>
          <p>
            Рассчитайте стоимость без звонка, выберите задачи и оставьте телефон для подтверждения.
          </p>
          <Link className="button" href="/#calculator">
            Открыть калькулятор
          </Link>
        </div>
        <div className="contact-card">
          <span>02</span>
          <h2>Для бизнеса</h2>
          <p>Опишите объект и график — подготовим вопросы для точной сметы.</p>
          <Link className="text-link" href="/business">
            Заполнить бриф
          </Link>
        </div>
        <div className="contact-card">
          <span>03</span>
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
