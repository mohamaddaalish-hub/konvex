import type { Metadata } from "next";
import { getI18n } from "./server";
import { localePath } from "./core";
import { metadata, siteUrl } from "@/lib/seo";
export async function localizedMetadata(
  title: string,
  description: string,
  path = "/",
  noindex = false,
): Promise<Metadata> {
  const { t, locale } = await getI18n();
  const translatedTitle = t(title).replace(/\s*\|\s*(کانوکس|KONVEX)$/i, "");
  const canonical = localePath(path, locale);
  return {
    ...metadata(translatedTitle, t(description), canonical, noindex),
    alternates: {
      canonical,
      languages: {
        fa: localePath(path, "fa"),
        en: localePath(path, "en"),
        "x-default": localePath(path, "fa"),
      },
    },
    openGraph: {
      title: translatedTitle,
      description: t(description),
      url: canonical,
      siteName: "KONVEX",
      locale: locale === "en" ? "en_GB" : "fa_IR",
      alternateLocale: locale === "en" ? ["fa_IR"] : ["en_GB"],
      type: "website",
      images: [
        {
          url: "/images/green/hero.webp",
          width: 1264,
          height: 848,
          alt: t("ابزار و تجهیزات صنعتی کانوکس"),
        },
      ],
    },
  };
}
