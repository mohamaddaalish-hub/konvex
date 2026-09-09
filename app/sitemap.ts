export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import {
  getCategories,
  getAllProducts,
  getApplications,
  getArticles,
} from "@/lib/catalog";
import { localePath } from "@/i18n/core";
import { siteUrl } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/products",
    "/applications",
    "/brands",
    "/new-products",
    "/featured-products",
    "/about",
    "/knowledge",
    "/contact",
    "/privacy",
    "/terms",
    ...getCategories().map((c) => "/products/" + c.slug),
    ...getAllProducts().map((p) => "/product/" + p.slug),
    ...getApplications().map((a) => "/applications/" + a.slug),
    ...getArticles().map((a) => "/knowledge/" + a.slug),
  ];
  return paths.flatMap((p) =>
    (["fa", "en"] as const).map((locale) => ({
      url: new URL(localePath(p || "/", locale), siteUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : p.startsWith("/product/") ? 0.8 : 0.6,
      alternates: {
        languages: {
          fa: new URL(localePath(p || "/", "fa"), siteUrl).toString(),
          en: new URL(localePath(p || "/", "en"), siteUrl).toString(),
        },
      },
    })),
  );
}
