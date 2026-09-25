import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";
import { serviceCatalog, type ServiceSlug, siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(serviceCatalog).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceCatalog[slug as ServiceSlug];
  if (!service) return {};
  const path = `/services/${slug}`;
  return {
    title: `${service.name} в Новосибирске и Бердске`,
    description: `${service.description} ${service.price}. Онлайн-расчёт и заказ в БлескПРО.`,
    alternates: { canonical: path },
    openGraph: {
      title: `${service.name} в Новосибирске и Бердске — БлескПРО`,
      description: service.description,
      url: path,
      images: [{ url: service.image, width: 1600, height: 1000 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.name} в Новосибирске и Бердске — БлескПРО`,
      description: service.description,
      images: [service.image],
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceCatalog[slug as ServiceSlug];
  if (!service) notFound();
  const isWindowCleaning = slug === "window-cleaning";
  const calculatorService = ({ "regular-cleaning": "regular", "deep-cleaning": "deep", "after-renovation": "renovation" } as const)[slug as Exclude<ServiceSlug, "window-cleaning">];
  const faq = [
    {
      q: isWindowCleaning ? "Как рассчитывается мойка окон?" : "Цена фиксируется заранее?",
      a: isWindowCleaning
        ? "Цена от 1 900 ₽ относится к доступным окнам. Пришлите фото или количество створок: до выезда согласуем стоимость, безопасный доступ и состав работ."
        : "Калькулятор показывает предварительную стоимость и состав работ. Для стандартного заказа её подтверждаем до выезда. Для сложного объекта сначала проверяем фото или проводим оценку.",
    },
    {
      q: "Нужно покупать средства?",
      a: "Нет. Команда привозит профессиональный инвентарь и базовый набор средств. Особые требования можно указать при подтверждении.",
    },
    {
      q: "Что делать, если результат не устроит?",
      a: "Сообщите менеджеру в день уборки. Проверим чек-лист и организуем бесплатное исправление пропущенных работ.",
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.name,
        description: service.description,
        areaServed: ["Новосибирск", "Бердск"],
        provider: { "@type": "Organization", name: "БлескПРО", url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: service.name,
            item: `${siteUrl}/services/${slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return (
    <main>
      <PublicHeader />
      <section className="inner-hero shell">
        <div>
          <p className="eyebrow">
            <span /> {service.eyebrow}
          </p>
          <h1>{service.name}</h1>
          <p>{service.description}</p>
          <div className="inner-actions">
            <a className="button" href={isWindowCleaning ? "/contacts" : `/?service=${calculatorService}#calculator`}>
              {isWindowCleaning ? "Согласовать мойку окон" : "Рассчитать стоимость"}
            </a>
            <dl>
              <div>
                <dt>Стоимость</dt>
                <dd>{service.price}</dd>
              </div>
              <div>
                <dt>Время</dt>
                <dd>{service.duration}</dd>
              </div>
            </dl>
          </div>
        </div>
        <Image
          src={service.image}
          alt={service.name}
          width="1600"
          height="1100"
          priority
          sizes="(max-width: 800px) 100vw, 45vw"
        />
      </section>
      <section className="section shell service-details">
        <div>
          <p className="eyebrow">
            <span /> Состав работ
          </p>
          <h2>Что входит</h2>
        </div>
        <ul>
          {service.includes.map((item) => (
            <li key={item}>
              <span>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="section exclusions">
        <div className="shell exclusions-inner">
          <div>
            <p className="eyebrow">
              <span /> Прозрачно до заказа
            </p>
            <h2>Что обсудим отдельно</h2>
          </div>
          <ul>
            {service.notIncluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section shell faq-section">
        <div>
          <p className="eyebrow">
            <span /> Вопросы
          </p>
          <h2>До оформления</h2>
        </div>
        <div>
          {faq.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <span>+</span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <PublicFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
