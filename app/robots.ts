import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { isPreviewDeployment } from "@/lib/deployment";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/crm", "/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
