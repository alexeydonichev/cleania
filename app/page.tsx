import Link from "next/link";
import Image from "next/image";
import { siteUrl } from "@/lib/site";
import HeroShowcase from "./components/HeroShowcase";
import OrderCalculator from "./components/OrderCalculator";
import { BookingProvider } from "./components/BookingProvider";
import { PublicFooter, PublicHeader } from "./components/SiteChrome";
import { ServiceOverview, CleaningDetails } from "./components/CleaningDetails";
import MotionDesign from "./components/MotionDesign";
import { serviceKeys, type ServiceKey } from "@/lib/quote";

const faqs = [
  ["Стоимость в калькуляторе окончательная?", "Это предварительный расчёт по выбранным параметрам. До выезда согласуем адрес, состояние и дополнительные работы, затем подтвердим стоимость. Работы вне согласованного списка обсуждаем отдельно."],
  ["Можно заказать уборку в Бердске?", "Да. В форме выберите Бердск и укажите адрес. Новосибирск и Бердск рассчитываются по одному базовому прайсу. Возможность выезда и удобное время подтвердим вместе с заявкой."],
  ["Что подготовить к приезду?", "Нужен доступ к воде и электричеству. Уберите ценные вещи, документы и предметы с поверхностей, которые нужно очистить. Для мытья шкафов или холодильника внутри заранее освободите их."],
  ["Нужно ли оставаться дома?", "Достаточно встретить сотрудников, объяснить особенности квартиры и быть на связи. Порядок передачи ключей и приёмки согласуем при подтверждении заказа."],
  ["Можно ли заказать окна отдельно?", "Да. Для отдельной мойки окон оставьте заявку через страницу контактов с пометкой в комментарии. В калькуляторе окна добавляются к уборке помещения: цена указана за одно двустворчатое окно. Панорамное и труднодоступное остекление оценивается отдельно."],
  ["Когда оплачивать и как проверить результат?", "Оплата — после уборки и приёмки работ. Пройдите по согласованному списку вместе с сотрудником: поверхности, кухня, санузлы и полы. Если что-то пропущено, сразу покажите это сотруднику."],
];
export default async function Home({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;
  const service = serviceKeys.includes(params.service as ServiceKey) ? params.service as ServiceKey : "regular";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "Cleania", url: siteUrl, areaServed: [{ "@type": "City", name: "Новосибирск" }, { "@type": "City", name: "Бердск" }] },
      { "@type": "WebSite", url: siteUrl, name: "Cleania", inLanguage: "ru-RU" },
      { "@type": "Service", name: "Уборка квартир и домов", areaServed: ["Новосибирск", "Бердск"], provider: { "@id": `${siteUrl}/#organization` } },
      { "@type": "FAQPage", mainEntity: faqs.map(([q,a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };
  return <BookingProvider initialService={service} key={service}><main>
    <a className="skip-link" href="#calculator">Перейти к расчёту уборки</a>
    <PublicHeader /><MotionDesign />
    <HeroShowcase />
    <section className="section shell" id="services">
      <div className="section-heading home-heading"><div><p className="eyebrow">01 / Под вашу задачу</p><h2>Чистота бывает разной.<br /><span>Выберите свою.</span></h2></div><p>Освежить квартиру к выходным, добраться до каждого уголка или убрать следы ремонта.</p></div>
      <ServiceOverview />
    </section>
    <section className="calculator-section" id="calculator">
      <div className="shell">
        <div className="section-heading home-heading"><div><p className="eyebrow">02 / Без звонка для расчёта</p><h2>Ваша уборка.<br /><span>Ваша понятная цена.</span></h2></div><p>Площадь, нужные задачи, удобный день. Стоимость меняется сразу — вы видите, за что платите.</p></div>
        <OrderCalculator />
      </div>
    </section>
    <section className="section shell" id="included">
      <div className="section-heading home-heading"><div><p className="eyebrow">03 / Всё по полочкам</p><h2>Что именно<br /><span>мы уберём?</span></h2></div><p>Посмотрите состав выбранной уборки по зонам. Окна и техника внутри добавляются отдельно.</p></div>
      <CleaningDetails />
    </section>
    <section className="care-section shell" id="quality">
      <div className="care-visual"><Image src="/images/cleania-home.webp" alt="Аккуратная гостиная, в которую приятно вернуться" width={750} height={850} sizes="(max-width: 700px) 90vw, 45vw" /><span>Ваш дом.<br />С заботой о деталях.</span></div>
      <div className="care-copy"><p className="eyebrow">04 / Спокойно на каждом шаге</p><h2>Хорошая уборка.<br /><span>Простой процесс.</span></h2>
        <ol className="care-steps">
          <li><b>01</b><div><h3>Вы рассказываете о доме</h3><p>Выбираете параметры и оставляете заявку. Можно добавить фото и важные пожелания.</p></div></li>
          <li><b>02</b><div><h3>Мы согласуем детали</h3><p>Подтверждаем состав работ, стоимость и время. Учитываем деликатные поверхности и особенности доступа.</p></div></li>
          <li><b>03</b><div><h3>Убираем, вы принимаете</h3><p>Приезжаем с инвентарём. Проверяем результат вместе с вами по согласованному списку.</p></div></li>
        </ol>
      </div>
    </section>
    <section className="section shell location-section">
      <p className="eyebrow">Рядом с вашим домом</p><div className="location-row"><h2>Новосибирск<span> + </span>Бердск</h2><Link className="text-link" href="/contacts">Зона работы и связь ↗</Link></div>
      <p>Квартиры и дома в городе, Академгородке и Бердске. Для удалённого адреса заранее согласуем выезд.</p>
    </section>
    <section className="section shell faq-section" id="faq"><div><p className="eyebrow">05 / До встречи дома</p><h2>Остались<br />вопросы?</h2></div><div>{faqs.map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="business-strip shell"><div><p className="eyebrow">Для вашего дела</p><h2>Чистый офис.<br />Свой график.</h2></div><div><p>Регулярная уборка коммерческих помещений. Состав работ и стоимость — по вашему объекту.</p><Link href="/business" className="button button-light">Обсудить уборку офиса ↗</Link></div></section>
    <PublicFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </main></BookingProvider>;
}
