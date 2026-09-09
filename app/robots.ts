export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { siteUrl, indexable } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexable
      ? {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/admin",
            "/api/",
            "/compare",
            "/wishlist",
            "/search",
            "/quote",
            "/print/",
            "/en/admin",
            "/en/compare",
            "/en/wishlist",
            "/en/search",
            "/en/quote",
            "/en/print/",
          ],
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: siteUrl + "/sitemap.xml",
  };
}
