import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { locations, type LocationSlug } from "@/lib/locations";
import { serviceCatalog, siteUrl } from "@/lib/site";
import { brandName, contactPhone } from "@/lib/brand";
import { PublicHeader, PublicFooter } from "@/app/components/SiteChrome";
import ContactLinks from "@/app/components/ContactLinks";
import CallbackRequest from "@/app/components/CallbackRequest";
export function generateStaticParams() { return Object.keys(locations).map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const place = locations[slug as LocationSlug]; if (!place) return {};
  const title = `Клининг в ${place.inCity} — уборка квартир и домов`;
  return { title, description: place.lead, alternates: { canonical: `/locations/${slug}` }, openGraph: { title, description: place.lead, url: `/locations/${slug}`, images: ["/images/editorial/interior.webp"] } };
}
export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const place = locations[slug as LocationSlug]; if (!place) notFound();
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Service", name: `Клининг в ${place.inCity}`, url: `${siteUrl}/locations/${slug}`, serviceType: "Уборка квартир и домов", areaServed: { "@type": "City", name: place.name }, provider: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: brandName, telephone: contactPhone } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Главная", item: siteUrl }, { "@type": "ListItem", position: 2, name: place.name, item: `${siteUrl}/locations/${slug}` }] },
  ] };
  return <main><PublicHeader /><section className="shell local-hero"><nav aria-label="Хлебные крошки"><a href="/">Главная</a> / {place.name}</nav><p className="eyebrow">БлескПРО · {place.name}</p><h1>Клининг в {place.inCity}</h1><p>{place.lead}</p><a href="/#calculator" className="button">Рассчитать стоимость уборки</a><Image className="article-cover" src="/images/editorial/interior.webp" alt="Светлая гостиная после уборки — пример интерьера" width={1440} height={960} priority sizes="93vw" /></section><section className="section shell"><div className="local-service-grid">{Object.entries(serviceCatalog).map(([key, service]) => <article key={key}><h2>{service.name}</h2><p>{service.description}</p><p>{service.price} · {service.duration}</p><a className="text-link" href={`/services/${key}`}>Что входит и что согласовать отдельно</a></article>)}</div><div className="local-copy"><h2>{place.heading}</h2>{place.details.map(text => <p key={text}>{text}</p>)}<h2>Как узнать стоимость до заказа</h2><p>Предварительный расчёт зависит от площади, состояния, санузлов и дополнительных работ. Окна, шкафы и техника внутри добавляются отдельно. Отправьте смету в мессенджер: подтвердим состав работ и цену перед выездом.</p><a className="text-link" href={`/articles/${place.article}`}>Практический разбор для вашего города</a><h2>Связаться без длинной анкеты</h2><ContactLinks /></div><CallbackRequest /><nav className="local-links" aria-label="Другие направления"><a href="/business">Уборка офисов и коммерческих помещений</a><a href={`/locations/${slug === "berdsk" ? "novosibirsk" : "berdsk"}`}>{slug === "berdsk" ? "Клининг в Новосибирске" : "Клининг в Бердске"}</a></nav></section><PublicFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></main>;
}
