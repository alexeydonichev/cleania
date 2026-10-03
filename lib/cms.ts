import { rawDb } from "@/db/runtime";
import { env } from "@/lib/runtime-env";
import { articles, type Article } from "./articles";
import { serviceCatalog } from "./site";
export type CmsDocument = { id: string; kind: "article" | "service"; draft: string; published: string | null; previous: string | null; version: number; updated_at: string };
export async function cmsRows(): Promise<CmsDocument[]> {
  return (await rawDb().prepare("SELECT id,kind,draft,published,previous,version,updated_at FROM cms_documents ORDER BY updated_at DESC").all<CmsDocument>()).results;
}
async function publishedRows() {
  if (!env.DB) return [];
  // An unavailable CMS must not erase the existing public site.
  try { return await cmsRows(); } catch { console.error("CMS unavailable: using bundled content"); return []; }
}
export async function publicArticles() {
  const result = new Map(articles.map(a => [a.slug, a]));
  for (const row of await publishedRows()) if (row.kind === "article") {
    const slug = row.id.slice("article:".length);
    if (row.published === "null") result.delete(slug);
    else if (row.published) { try { result.set(slug, JSON.parse(row.published) as Article); } catch {} }
  }
  return [...result.values()].sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
}
export async function publicServices() {
  const result = structuredClone(serviceCatalog);
  for (const row of await publishedRows()) if (row.kind === "service" && row.published && Object.hasOwn(result, row.id.slice(8))) {
    Object.assign(result[row.id.slice(8) as keyof typeof result], JSON.parse(row.published));
  }
  return result;
}
export async function cmsWorkspace() {
  const rows = await cmsRows();
  const baseline: CmsDocument[] = [
    ...articles.map(a => ({ id: `article:${a.slug}`, kind: "article" as const, draft: JSON.stringify(a), published: JSON.stringify(a), previous: null, version: 0, updated_at: a.modifiedAt })),
    ...Object.entries(serviceCatalog).map(([slug,s]) => ({ id: `service:${slug}`, kind: "service" as const, draft: JSON.stringify(s), published: JSON.stringify(s), previous: null, version: 0, updated_at: "" })),
  ];
  return [...new Map([...baseline, ...rows].map(row => [row.id,row])).values()];
}
