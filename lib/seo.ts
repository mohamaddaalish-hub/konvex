import { localePath, type Locale } from "@/i18n/core";
import type { Metadata } from "next";
export const siteUrl = process.env.SITE_URL || "https://konvex.example";
export const indexable = process.env.SITE_INDEXABLE === "true";
export function metadata(
  title: string,
  description: string,
  path = "/",
  noindex = false,
): Metadata {
  return {
    title: title.replace(/\s*\|\s*(?:کانوکس|KONVEX)$/i, ""),
    description,
    alternates: { canonical: path },
    robots:
      !indexable || noindex
        ? { index: false, follow: !noindex }
        : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "KONVEX | کانوکس",
      locale: "fa_IR",
      type: "website",
      images: [
        {
          url: "/images/hero.webp",
          width: 1264,
          height: 848,
          alt: "ابزار و تجهیزات صنعتی کانوکس",
        },
      ],
    },
  };
}
export function safeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
export function breadcrumbSchema(
  items: { name: string; href?: string }[],
  locale: Locale = "fa",
  base = siteUrl,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((i, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: i.name,
      ...(i.href
        ? { item: new URL(localePath(i.href, locale), base).toString() }
        : {}),
    })),
  };
}
