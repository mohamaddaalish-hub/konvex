import { getLocale, getMessages } from "next-intl/server";
import { makeI18n, type Locale, type Dictionary } from "./core";
export async function getI18n() {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  return makeI18n(
    locale,
    (messages.dictionary || {}) as Dictionary,
    (messages.public as { siteUrl?: string })?.siteUrl,
  );
}
