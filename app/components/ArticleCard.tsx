import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatArticleDate } from "@/lib/articles";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="article-card">
      <Link href={`/articles/${article.slug}`}>
        <span className="article-card-category">{article.category}</span>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <span className="article-card-meta">
          <time dateTime={article.modifiedAt}>Обновлено {formatArticleDate(article.modifiedAt)}</time>
          <span>{article.readTime}</span>
        </span>
      </Link>
    </article>
  );
}
