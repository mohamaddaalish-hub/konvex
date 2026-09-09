"use client";
import { useLayoutEffect, useMemo } from "react";
import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";
import { usePreferences } from "./preferences";
import type { Dictionary } from "@/i18n/core";
export function RuntimeTranslations({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const locale = useLocale(),
    root = useMessages(),
    { mergeDictionary } = usePreferences();
  useLayoutEffect(() => {
    mergeDictionary(dictionary);
  }, [dictionary, mergeDictionary]);
  const messages = useMemo(
    () => ({
      ...root,
      dictionary: { ...(root.dictionary as Dictionary), ...dictionary },
    }),
    [root, dictionary],
  );
  return (
    <NextIntlClientProvider
      locale={locale}
      timeZone="Asia/Tehran"
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
