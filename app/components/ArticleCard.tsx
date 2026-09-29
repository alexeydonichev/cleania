import type { Article } from "@/lib/articles";
import { formatArticleDate } from "@/lib/articles";
import Image from "next/image";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="article-card">
      <a href={`/articles/${article.slug}`}>
        {article.image && <Image className="article-cover" src={article.image} alt={article.title} width={1440} height={960} sizes="(max-width:750px) 93vw, 31vw" />}
        <span className="article-card-category">{article.category}</span>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <span className="article-card-meta">
          <time dateTime={article.modifiedAt}>Обновлено {formatArticleDate(article.modifiedAt)}</time>
          <span>{article.readTime}</span>
        </span>
      </a>
    </article>
  );
}
