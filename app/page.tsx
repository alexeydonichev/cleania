import Link from "next/link";
import Image from "next/image";
import { siteUrl } from "@/lib/site";
import OrderCalculator from "./components/OrderCalculator";

const services = [
  {
    number: "01",
    title: "Поддерживающая",
    text: "Регулярная чистота без генеральных подвигов.",
    price: "от 2 490 ₽",
    href: "/services/regular-cleaning",
  },
  {
    number: "02",
    title: "Генеральная",
    text: "Тщательно: кухня, санузлы, трудные поверхности.",
    price: "от 4 490 ₽",
    href: "/services/deep-cleaning",
  },
  {
    number: "03",
    title: "После ремонта",
    text: "Пыль, следы смесей, окна и готовность к переезду.",
    price: "от 6 990 ₽",
    href: "/services/after-renovation",
  },
  {
    number: "04",
    title: "Для бизнеса",
    text: "Офисы и коммерческие объекты с понятным SLA.",
    price: "по смете",
    href: "/business",
  },
];

const guarantees = [
  [
    "Цена до заказа",
    "Показываем состав работ и каждую доплату до подтверждения.",
  ],
  [
    "Проверенные исполнители",
    "Документы, обучение, рейтинг и контроль чек-листа.",
  ],
  [
    "Вернёмся и исправим",
    "Если что-то пропустили — приедем повторно без доплаты.",
  ],
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Cleania",
        url: `${siteUrl}/`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "Cleania",
        inLanguage: "ru-RU",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Service",
        serviceType: "Профессиональная уборка помещений",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "Новосибирск",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "RUB",
          lowPrice: 2490,
        },
      },
    ],
  };

  return (
    <main>
      <a className="skip-link" href="#calculator">
        К расчёту уборки
      </a>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Cleania — на главную">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>Cleania</span>
        </Link>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <Link href="#services">Услуги</Link>
          <Link href="#quality">Как работаем</Link>
          <Link href="/business">Для бизнеса</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>
        <div className="header-actions">
          <Link className="city-link" href="/contacts">
            Новосибирск
          </Link>
          <Link className="button button-small" href="#calculator">
            Рассчитать
          </Link>
        </div>
        <details className="mobile-menu">
          <summary aria-label="Открыть меню">☰</summary>
          <nav>
            <Link href="#services">Услуги</Link>
            <Link href="#quality">Как работаем</Link>
            <Link href="/business">Для бизнеса</Link>
            <Link href="/contacts">Контакты</Link>
          </nav>
        </details>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Порядок начинается здесь
          </p>
          <h1>
            Уборка, которую удобно <em>заказывать</em>
          </h1>
          <p className="hero-lead">
            Цена, свободное время и состав работ — сразу на экране. Без звонков,
            скрытых доплат и ожидания ответа менеджера.
          </p>
          <div className="hero-actions">
            <Link className="button" href="#calculator">
              Узнать точную цену <span aria-hidden="true">↘</span>
            </Link>
            <span className="micro-proof">
              <b>24/7</b> расчёт доступен
              <br />
              без звонка менеджеру
            </span>
          </div>
        </div>
        <figure className="hero-visual">
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=86"
            alt="Профессиональный клинер убирает светлую кухню"
            width="1400"
            height="1050"
            fetchPriority="high"
          />
          <figcaption>
            <span>01 / 04</span>
            <strong>
              Чисто по чек-листу,
              <br />
              не на глаз
            </strong>
          </figcaption>
          <div className="floating-note">
            <span className="status-dot" />
            <div>
              <b>Онлайн-расчёт работает</b>
              <small>Цена меняется сразу</small>
            </div>
          </div>
        </figure>
      </section>

      <section className="ticker" aria-label="Преимущества">
        <span>Фиксируем стоимость до начала</span>
        <i />
        <span>Привозим всё с собой</span>
        <i />
        <span>Контроль качества после уборки</span>
      </section>

      <section className="section shell" id="calculator">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">
              <span /> Онлайн-калькулятор
            </p>
            <h2>
              Соберите свою
              <br />
              <em>идеальную уборку</em>
            </h2>
          </div>
          <p>
            Калькулятор учитывает тип уборки, площадь, санузлы, загрязнение,
            дополнительные задачи и регулярность. Итог обновляется сразу.
          </p>
        </div>
        <OrderCalculator />
      </section>

      <section className="section services-section" id="services">
        <div className="shell">
          <div className="section-heading compact-heading">
            <p className="eyebrow">
              <span /> Не просто квадратные метры
            </p>
            <h2>Услуга под задачу</h2>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <Link
                className="service-card"
                href={service.href}
                key={service.title}
              >
                <span className="service-number">{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
                <div className="service-bottom">
                  <strong>{service.price}</strong>
                  <span aria-hidden="true">↗</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell quality-grid" id="quality">
        <div className="quality-image">
          <Image
            src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=84"
            alt="Инвентарь для профессиональной уборки"
            width="1200"
            height="1400"
            loading="lazy"
          />
          <span>
            32 пункта
            <br />
            контроля
          </span>
        </div>
        <div className="quality-copy">
          <p className="eyebrow">
            <span /> Качество как система
          </p>
          <h2>
            Результат можно
            <br />
            <em>проверить</em>
          </h2>
          <p className="quality-intro">
            У каждого заказа есть чек-лист, ответственный менеджер и история.
            Клинер отмечает этапы, а вы принимаете работу по понятным критериям.
          </p>
          <ol className="guarantee-list">
            {guarantees.map(([title, text], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section b2b-section">
        <div className="shell b2b-inner">
          <div>
            <p className="eyebrow eyebrow-light">
              <span /> Cleania для бизнеса
            </p>
            <h2>
              Чистота по SLA.
              <br />
              <em>Отчётность — по фактам.</em>
            </h2>
          </div>
          <div className="b2b-copy">
            <p>
              Фиксируем зоны, график, стандарты и стоимость. В CRM видны смены,
              фото, замечания и расходы по каждому объекту.
            </p>
            <Link className="button button-light" href="/business">
              Обсудить объект <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-top">
          <div>
            <Link className="brand brand-footer" href="/">
              <span className="brand-mark">C</span>
              <span>Cleania</span>
            </Link>
            <p>
              Профессиональная уборка
              <br />с человеческим сервисом.
            </p>
          </div>
          <div className="footer-links">
            <b>Услуги</b>
            <Link href="/services/regular-cleaning">Поддерживающая</Link>
            <Link href="/services/deep-cleaning">Генеральная</Link>
            <Link href="/services/after-renovation">После ремонта</Link>
            <Link href="/business">Для бизнеса</Link>
          </div>
          <div className="footer-links">
            <b>Компания</b>
            <Link href="#quality">Как работаем</Link>
            <Link href="/contacts">Контакты</Link>
            <Link href="/crm">Вход в CRM</Link>
          </div>
          <div className="footer-cta">
            <span>Готовы начать?</span>
            <Link href="#calculator">
              Рассчитать уборку <b>↗</b>
            </Link>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Cleania</span>
          <Link href="/privacy">Политика конфиденциальности</Link>
          <span>Сайт работает в Новосибирске</span>
        </div>
      </footer>

      <div className="mobile-order-bar">
        <div>
          <small>Уборка от</small>
          <b>2 490 ₽</b>
        </div>
        <Link className="button button-small" href="#calculator">
          Рассчитать
        </Link>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
