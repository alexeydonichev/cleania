import type { Metadata } from "next";
import BusinessBrief from "@/app/components/BusinessBrief";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";

export const metadata: Metadata = {
  title: "Клининг для бизнеса в Новосибирске",
  description:
    "Регулярная уборка офисов и коммерческих объектов: SLA, чек-листы, контроль смен и прозрачная отчётность.",
  alternates: { canonical: "/business" },
};

export default function BusinessPage() {
  return (
    <main>
      <PublicHeader />
      <section className="business-hero">
        <div className="shell business-hero-grid">
          <div>
            <p className="eyebrow eyebrow-light">
              <span /> Cleania для бизнеса
            </p>
            <h1>
              Чистота —<br />
              управляемый
              <br />
              <em>процесс</em>
            </h1>
            <p>
              Закрепляем зоны, график, ответственных и критерии приёмки.
              Руководитель видит смены, замечания и экономику объекта в одной
              системе.
            </p>
          </div>
          <BusinessBrief />
        </div>
      </section>
      <section className="section shell business-proof">
        <div>
          <span>01</span>
          <h3>SLA вместо обещаний</h3>
          <p>
            В договоре фиксируются время реакции, состав работ и порядок
            исправления замечаний.
          </p>
        </div>
        <div>
          <span>02</span>
          <h3>Замены без простоя</h3>
          <p>
            Бригада и резерв планируются в CRM, поэтому объект не остаётся без
            уборки.
          </p>
        </div>
        <div>
          <span>03</span>
          <h3>Отчёт по каждому объекту</h3>
          <p>
            Смены, фото, расходники, оценка и себестоимость доступны в
            административной панели.
          </p>
        </div>
      </section>
      <section className="section business-process">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">
                <span /> Запуск без хаоса
              </p>
              <h2>
                От заявки
                <br />
                <em>до первой смены</em>
              </h2>
            </div>
            <p>
              Стандартный объект запускается после осмотра, согласования карты
              зон и графика. Сложные работы выносим в отдельную смету.
            </p>
          </div>
          <ol>
            <li>
              <span>01</span>
              <b>Бриф и звонок</b>
              <p>Фиксируем объект, режим доступа и ожидания.</p>
            </li>
            <li>
              <span>02</span>
              <b>Осмотр</b>
              <p>Считаем площади и точки повышенного внимания.</p>
            </li>
            <li>
              <span>03</span>
              <b>Карта работ</b>
              <p>Согласуем зоны, периодичность, SLA и цену.</p>
            </li>
            <li>
              <span>04</span>
              <b>Контроль запуска</b>
              <p>Супервайзер принимает первые смены по чек-листу.</p>
            </li>
          </ol>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
