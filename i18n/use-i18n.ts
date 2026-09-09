import { useLocale, useMessages } from "next-intl";
import { makeI18n, type Locale, type Dictionary } from "./core";
export function useI18n() {
  const locale = useLocale() as Locale;
  const messages = useMessages();
  return makeI18n(
    locale,
    (messages.dictionary || {}) as Dictionary,
    (messages.public as { siteUrl?: string })?.siteUrl,
  );
}
