import Link from "next/link";
import { siteUrl } from "@/lib/site";
import { brandName, brandLogo, contactPhone } from "@/lib/brand";
import HeroShowcase from "./components/HeroShowcase";
import OrderCalculator from "./components/OrderCalculator";
import { BookingProvider } from "./components/BookingProvider";
import { PublicFooter, PublicHeader } from "./components/SiteChrome";
import { ServiceOverview, CleaningDetails } from "./components/CleaningDetails";
import { serviceKeys, type ServiceKey } from "@/lib/quote";
import { articles } from "@/lib/articles";
import CleaningProcess from "./components/CleaningProcess";
import BeforeAfter from "./components/BeforeAfter";
import ArticleCard from "./components/ArticleCard";

const faqs = [
  ["Стоимость в калькуляторе окончательная?", "Это предварительный расчёт по выбранным параметрам. До выезда согласуем адрес, состояние и дополнительные работы, затем подтвердим стоимость. Работы вне согласованного списка обсуждаем отдельно."],
  ["Можно заказать уборку в Бердске?", "Да. В форме выберите Бердск и укажите адрес. Новосибирск и Бердск рассчитываются по одному базовому прайсу. Возможность выезда и удобное время подтвердим вместе с заявкой."],
  ["Что подготовить к приезду?", "Нужен доступ к воде и электричеству. Уберите ценные вещи, документы и предметы с поверхностей, которые нужно очистить. Для мытья шкафов или холодильника внутри заранее освободите их."],
  ["Нужно ли оставаться дома?", "Достаточно встретить сотрудников, объяснить особенности квартиры и быть на связи. Порядок передачи ключей и приёмки согласуем при подтверждении заказа."],
  ["Можно ли заказать окна отдельно?", "Да. Для отдельной мойки окон оставьте заявку через страницу контактов с пометкой в комментарии. В калькуляторе окна добавляются к уборке помещения: цена указана за одно двустворчатое окно. Панорамное и труднодоступное остекление оценивается отдельно."],
  ["Когда оплачивать и как проверить результат?", "Оплата — после уборки и приёмки работ. Пройдите по согласованному списку вместе с сотрудником: поверхности, кухня, санузлы и полы. Если что-то пропущено, сразу покажите это сотруднику."],
  ["Что входит в поддерживающую уборку?", "Поддерживающая уборка помогает регулярно сохранять порядок: убираем пыль с доступных поверхностей, пылесосим и моем полы, приводим в порядок кухню и санузел, выносим мусор. Глубокая очистка техники внутри, окон, шкафов и труднодоступных зон добавляется отдельно."],
  ["Чем генеральная уборка отличается от поддерживающей?", "Генеральная уборка глубже: помимо обычной чистоты прорабатываем плинтусы, двери, радиаторы, сантехнику, кухонные поверхности и другие зоны, которые не входят в регулярный визит. Точный список работ согласуем до приезда."],
  ["Что входит в уборку после ремонта?", "Удаляем строительную пыль и следы отделочных материалов с доступных поверхностей, очищаем полы, двери, подоконники, санузел и кухню. Работы со сложными загрязнениями, окнами и выносом строительного мусора заранее согласовываются по фото или при расчёте заказа."],
  ["Сколько времени занимает уборка квартиры?", "Это зависит от площади, количества комнат, состояния квартиры и выбранных дополнительных работ. До подтверждения заказа уточним состав работ, количество сотрудников и ориентировочное время."],
  ["Можно ли заказать уборку в день обращения?", "Если в расписании есть свободное окно — да. Укажите адрес, площадь и желаемый вид уборки в калькуляторе или напишите в мессенджер: проверим ближайшее доступное время."],
  ["Можно ли заказать уборку дома или коттеджа?", "Да. В калькуляторе выберите дом и укажите площадь. Для дома заранее уточняем этажи, количество санузлов, окна и адрес; выезд в Академгородок и за пределы города подтверждаем до заказа."],
  ["Какие средства и инвентарь привозит команда?", "Команда привозит профессиональный инвентарь и базовый набор средств. Если в доме есть ребёнок, животные, чувствительность к запахам или особые покрытия, сообщите об этом заранее — учтём это при согласовании работ."],
];
export default async function Home({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;
  const service = serviceKeys.includes(params.service as ServiceKey) ? params.service as ServiceKey : "regular";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: brandName, url: siteUrl, logo: `${siteUrl}${brandLogo.src}`, telephone: contactPhone, areaServed: [{ "@type": "City", name: "Новосибирск" }, { "@type": "City", name: "Бердск" }] },
      { "@type": "WebSite", url: siteUrl, name: brandName, inLanguage: "ru-RU" },
      { "@type": "Service", name: "Уборка квартир и домов", areaServed: ["Новосибирск", "Бердск"], provider: { "@id": `${siteUrl}/#organization` } },
      { "@type": "FAQPage", mainEntity: faqs.map(([q,a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };
  return <BookingProvider initialService={service} key={service}><main>
    <a className="skip-link" href="#calculator">Перейти к расчёту уборки</a>
    <PublicHeader />
    <HeroShowcase />
    <section className="section shell" id="services">
      <div className="section-heading home-heading compact-heading"><div><p className="eyebrow">Под вашу задачу</p><h2>Чистота бывает разной. <span>Выберите свою.</span></h2></div><p>Освежить квартиру к выходным, добраться до каждого уголка или убрать следы ремонта.</p></div>
      <ServiceOverview />
    </section>
    <section className="calculator-section" id="calculator">
      <div className="shell">
        <div className="section-heading home-heading compact-heading"><div><p className="eyebrow">Без звонка для расчёта</p><h2>Ваша уборка. <span>Ваша понятная цена.</span></h2></div><p>Площадь, нужные задачи, удобный день. Стоимость меняется сразу — вы видите, за что платите.</p></div>
        <OrderCalculator />
      </div>
    </section>
    <section className="section shell" id="included">
      <div className="section-heading home-heading compact-heading"><div><p className="eyebrow">Всё по полочкам</p><h2>Что именно <span>мы уберём?</span></h2></div><p>Посмотрите состав выбранной уборки по зонам. Окна и техника внутри добавляются отдельно.</p></div>
      <CleaningDetails />
    </section>
    <CleaningProcess />
    <BeforeAfter />
    <section className="section shell location-section">
      <p className="eyebrow">Рядом с вашим домом</p><div className="location-row"><h2>Новосибирск<span> + </span>Бердск</h2><Link className="text-link" href="/contacts">Зона работы и связь</Link></div>
      <p>Квартиры и дома в городе, Академгородке и Бердске. Для удалённого адреса заранее согласуем выезд.</p>
    </section>
    <section className="section shell knowledge-section" aria-labelledby="knowledge-title">
      <div className="section-heading home-heading compact-heading"><div><p className="eyebrow">Гид по чистоте</p><h2 id="knowledge-title">Полезное <span>об уборке.</span></h2></div><p>Понятно разбираем состав работ, цену, подготовку к приезду и частые сценарии без пустых обещаний.</p></div>
      <div className="article-grid article-grid-home">{articles.slice(0, 3).map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
      <Link className="text-link knowledge-all-link" href="/articles">Все статьи</Link>
    </section>
    <section className="section shell faq-section" id="faq"><div><p className="eyebrow">До встречи дома</p><h2>Остались<br />вопросы?</h2></div><div>{faqs.map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="business-strip shell"><div><p className="eyebrow">Для вашего дела</p><h2>Чистый офис.<br />Свой график.</h2></div><div><p>Регулярная уборка коммерческих помещений. Состав работ и стоимость — по вашему объекту.</p><Link href="/business" className="button button-light">Обсудить уборку офиса</Link></div></section>
    <PublicFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </main></BookingProvider>;
}
