import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";

export const metadata: Metadata = {
  title: "Контакты и зона работы",
  description:
    "Cleania в Новосибирске: онлайн-заказ уборки, зона обслуживания и способы связи.",
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
          На этапе настройки основной канал — заявка на сайте. Телефон,
          юридические реквизиты и публичные мессенджеры добавляются владельцем
          перед рекламным запуском.
        </p>
      </section>
      <section className="section shell contacts-grid">
        <div className="contact-card">
          <span>01</span>
          <h2>Заказать уборку</h2>
          <p>
            Получите расчёт и оставьте телефон. Заявка сразу появится в CRM.
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
            Заполнить бриф ↗
          </Link>
        </div>
        <div className="contact-card">
          <span>03</span>
          <h2>Зона работы</h2>
          <p>
            Новосибирск. Конкретный адрес и выезд за границы города
            подтверждаются менеджером.
          </p>
          <span className="zone-tag">Новосибирск</span>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
