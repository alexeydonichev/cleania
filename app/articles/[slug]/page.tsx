import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/app/components/ArticleCard";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";
import {
  articles,
  formatArticleDate,
  getArticle,
  getRelatedArticles,
} from "@/lib/articles";
import { brandName, brandLogo } from "@/lib/brand";
import { serviceCatalog, type ServiceSlug, siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const path = `/articles/${article.slug}`;
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: article.seoTitle,
      description: article.description,
      url: path,
      publishedTime: `${article.publishedAt}T00:00:00+07:00`,
      modifiedTime: `${article.modifiedAt}T00:00:00+07:00`,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const articleUrl = `${siteUrl}/articles/${article.slug}`;
  const relatedArticles = getRelatedArticles(article.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        headline: article.title,
        description: article.description,
        url: articleUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
        datePublished: `${article.publishedAt}T00:00:00+07:00`,
        dateModified: `${article.modifiedAt}T00:00:00+07:00`,
        inLanguage: "ru-RU",
        author: { "@id": `${siteUrl}/#organization` },
        publisher: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: brandName,
          logo: { "@type": "ImageObject", url: `${siteUrl}${brandLogo.src}` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Гид по чистоте",
            item: `${siteUrl}/articles`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <main>
      <PublicHeader />
      <section className="article-page-hero shell">
        <nav className="article-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <Link href="/articles">Гид по чистоте</Link>
        </nav>
        <p className="eyebrow">{article.category}</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <div className="article-page-meta">
          <time dateTime={article.modifiedAt}>
            Обновлено {formatArticleDate(article.modifiedAt)}
          </time>
          <span>{article.readTime}</span>
        </div>
      </section>
      <section className="section shell article-content-grid">
        <article className="article-body">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
        <aside className="article-aside" aria-label="Полезные ссылки">
          <div>
            <p className="eyebrow">Рассчитать уборку</p>
            <h2>Соберите свою смету</h2>
            <p>
              Укажите площадь и нужные задачи — предварительная стоимость
              изменится сразу.
            </p>
            <Link className="button button-small" href="/#calculator">
              Открыть калькулятор
            </Link>
          </div>
          <div className="article-service-links">
            <b>По теме статьи</b>
            {article.relatedServices.map((slug) => {
              const service = serviceCatalog[slug as ServiceSlug];
              return (
                <Link key={slug} href={`/services/${slug}`}>
                  {service.name}
                </Link>
              );
            })}
          </div>
        </aside>
      </section>
      <section className="section shell article-related-section">
        <div className="article-related-heading">
          <div>
            <p className="eyebrow">Читайте также</p>
            <h2>Ещё полезные материалы</h2>
          </div>
          <Link className="text-link" href="/articles">
            Все статьи
          </Link>
        </div>
        <div className="article-grid article-grid-related">
          {relatedArticles.map((related) => (
            <ArticleCard key={related.slug} article={related} />
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
