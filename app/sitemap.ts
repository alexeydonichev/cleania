import type { MetadataRoute } from "next";
import { publicArticles } from "@/lib/cms";
import { serviceCatalog, siteUrl } from "@/lib/site";
import { locations } from "@/lib/locations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await publicArticles();
  const siteUpdatedAt = new Date("2026-09-30T00:00:00+07:00");
  return [
    { url: siteUrl, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(locations).map(slug => ({ url: `${siteUrl}/locations/${slug}`, lastModified: siteUpdatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...Object.keys(serviceCatalog).map((slug) => ({
      url: `${siteUrl}/services/${slug}`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${siteUrl}/articles`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      lastModified: new Date(`${article.modifiedAt}T00:00:00+07:00`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/business`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contacts`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
