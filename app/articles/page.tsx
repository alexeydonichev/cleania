import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";
import ArticleCard from "@/app/components/ArticleCard";
import { articles } from "@/lib/articles";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Гид по чистоте: статьи об уборке",
  description:
    "Практические статьи об уборке квартиры и дома в Новосибирске и Бердске: состав работ, расчёт, окна, переезд и уборка после ремонта.",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Гид по чистоте — БлескПРО",
    description:
      "Практические ответы об уборке квартиры и дома, подготовке к заказу, окнах и переезде.",
    url: "/articles",
    images: [
      {
        url: "/brand/social-preview-blue.png",
        width: 1200,
        height: 630,
        alt: "БлескПРО — гид по чистоте",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Гид по чистоте — БлескПРО",
    description:
      "Практические ответы об уборке квартиры и дома, подготовке к заказу, окнах и переезде.",
    images: ["/brand/social-preview-blue.png"],
  },
};

export default function ArticlesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/articles#collection`,
    name: "Гид по чистоте — БлескПРО",
    description: metadata.description,
    url: `${siteUrl}/articles`,
    inLanguage: "ru-RU",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/articles/${article.slug}`,
        name: article.title,
      })),
    },
  };

  return (
    <main>
      <PublicHeader />
      <section className="article-index-hero shell">
        <p className="eyebrow">Гид по чистоте</p>
        <h1>Полезное об уборке</h1>
        <p>
          Разбираем состав работ, расчёт, подготовку к приезду команды и
          частые сценарии — от квартиры после ремонта до дома перед переездом.
        </p>
      </section>
      <section className="section shell article-index-section">
        <div className="article-index-heading">
          <p>Новосибирск · Академгородок · Бердск</p>
          <span>{articles.length} материалов</span>
        </div>
        <div className="article-grid">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
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
