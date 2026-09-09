import { NextResponse } from "next/server";
import { getDictionary, productDictionary } from "./content-translations";
import { makeI18n, type Locale } from "@/i18n/core";
export function requestLocale(req: Request): Locale {
  return req.headers.get("x-konvex-locale") === "en" ||
    new URL(req.url).searchParams.get("locale") === "en"
    ? "en"
    : "fa";
}
export function requestI18n(req: Request) {
  return makeI18n(requestLocale(req), getDictionary());
}
export function jsonLocalized(
  req: Request,
  data: unknown,
  init?: ResponseInit,
) {
  const { t, locale } = requestI18n(req);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const body = { ...data } as Record<string, unknown>;
    // Add a bounded display dictionary while keeping every canonical API field unchanged.
    const products = (body.products as { id: string }[] | undefined) || [];
    const suggested = (body.suggested as { id: string }[] | undefined) || [];
    const product = body.product as { id: string } | undefined;
    const ids = [...products, ...suggested, ...(product ? [product] : [])].map(
      (p) => p.id,
    );
    if (ids.length)
      body.dictionary = productDictionary([...new Set(ids)], !!product);
    for (const key of ["error", "message"])
      if (typeof body[key] === "string") body[key] = t(body[key]);
    if (body.fields && typeof body.fields === "object")
      body.fields = Object.fromEntries(
        Object.entries(body.fields).map(([key, value]) => [key, t(value)]),
      );
    if (typeof body.details === "string" && locale === "en") {
      body.details = body.details
        .split(" / ")
        .map((s) => {
          const index = s.indexOf(": ");
          return index >= 0
            ? s.slice(0, index + 2) + t(s.slice(index + 2))
            : t(s);
        })
        .join(" / ");
    }
    return NextResponse.json(body, init);
  }
  return NextResponse.json(data, init);
}
