import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { siteUrl } from "@/lib/seo";
import { headers } from "next/headers";
import { requestDictionaryScope } from "@/lib/dictionary-scope";
import { getDictionary } from "@/lib/content-translations";
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  return {
    locale: hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale,
    timeZone: "Asia/Tehran",
    messages: {
      public: { siteUrl },
      dictionary: getDictionary(
        requestDictionaryScope((await headers()).get("x-konvex-path") || "/"),
      ),
    },
  };
});
