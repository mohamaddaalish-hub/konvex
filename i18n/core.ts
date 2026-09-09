export type Locale = "fa" | "en";
export type Dictionary = Record<string, string>;
export function cleanDisplay(value: string) {
  return value.replace(/\\u200c/gi, "\u200c").replace(/\\u200d/gi, "\u200d");
}
export function messageKey(source: string) {
  source = cleanDisplay(source).replace(/\s+/g, " ").trim();
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return "m" + (hash >>> 0).toString(36);
}
export function translate(
  source: unknown,
  locale: Locale,
  dictionary: Dictionary = {},
  values: Record<string, unknown> = {},
): string {
  if (source === undefined || source === null) return "";
  let text = cleanDisplay(String(source));
  const key = messageKey(text);
  if (locale === "en") {
    const edge = text.match(/^(\s*)[\s\S]*?(\s*)$/);
    text =
      (edge?.[1] || "") + (dictionary[key] ?? text.trim()) + (edge?.[2] || "");
  }
  text = text.replace(/\{(v\d+|count|name|total|number)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
  if (locale === "en")
    text = text
      .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
      .replace(/٬/g, ",")
      .replace(/٫/g, ".")
      .replace(/٪/g, "%");
  return text;
}
export function localePath(href: string, locale: Locale) {
  if (
    !href ||
    !href.startsWith("/") ||
    href.startsWith("//") ||
    /^\/(api|uploads|images|fonts|downloads|_next)(\/|\?|$)/.test(href) ||
    /\.[a-z0-9]+(?:\?|$)/i.test(href)
  )
    return href;
  const path = href.replace(/^\/(fa|en)(?=\/|\?|#|$)/, "") || "/";
  return locale === "en" ? "/en" + (path === "/" ? "" : path) : path;
}
export const number = (value: string | number, locale: Locale) =>
  new Intl.NumberFormat(locale === "en" ? "en-GB" : "fa-IR").format(
    Number(value),
  );
export function makeI18n(
  locale: Locale,
  dictionary: Dictionary,
  siteUrl = "https://konvex.example",
) {
  return {
    siteUrl,
    dictionary,
    locale,
    dir: locale === "en" ? ("ltr" as const) : ("rtl" as const),
    t: (s: unknown, v?: Record<string, unknown>) =>
      translate(s, locale, dictionary, v),
    n: (v: number | string) => number(v, locale),
    path: (v: string) => localePath(v, locale),
  };
}
