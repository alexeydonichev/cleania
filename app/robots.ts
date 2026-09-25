import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { isPreviewDeployment } from "@/lib/deployment";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    // `noindex` only works when a crawler can fetch the protected page. CRM is
    // deliberately crawlable but sends noindex/nofollow from its own metadata.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
