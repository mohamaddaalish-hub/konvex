import { getDB } from "./db";
import {
  getCategories,
  getProductsByIds,
  getProduct,
  getEntity,
  queryProducts,
  parseQuery,
  getArticles,
} from "./catalog";
import type { Application, Product, QueryOptions } from "./types";
export type DictionaryScope = {
  products?: string[];
  fullProducts?: string[];
  articles?: string[];
  fullArticles?: string[];
  allProducts?: boolean;
};
export function requestDictionaryScope(uri: string): DictionaryScope {
  const url = new URL(uri || "/", "https://local.invalid");
  const pathname = url.pathname.replace(/^\/(fa|en)(?=\/|$)/, "") || "/";
  const locale = url.pathname.startsWith("/en") ? "en" : "fa";
  const params: Record<string, string | string[]> = {};
  for (const [k, v] of url.searchParams) {
    const old = params[k];
    params[k] =
      old === undefined ? v : Array.isArray(old) ? [...old, v] : [old, v];
  }
  const q = parseQuery(params);
  const ids = new Set<string>(),
    full: string[] = [],
    articles: string[] = [],
    fullArticles: string[] = [];
  const collect = (options: QueryOptions) => {
    const result = queryProducts({ ...options, locale });
    result.products.forEach((p) => ids.add(p.id));
    for (const f of result.facets)
      for (const option of f.options) {
        if (
          /[\u0600-\u06ff]/.test(option.value) &&
          f.key !== "brand" &&
          f.key !== "application"
        ) {
          const row = getDB()
            .prepare(
              "SELECT product_id FROM product_attributes WHERE key=? AND value=? LIMIT 1",
            )
            .get(f.key, option.value) as { product_id: string } | undefined;
          if (row) ids.add(row.product_id);
        }
      }
    return result;
  };
  if (pathname === "/") {
    for (const collection of ["featured", "new", "popular"] as const)
      collect({ collection, pageSize: 4 });
    getArticles()
      .slice(0, 3)
      .forEach((a) => articles.push(a.id));
  } else if (pathname.startsWith("/product/")) {
    const p = getProduct(decodeURIComponent(pathname.slice(9)));
    if (p) {
      ids.add(p.id);
      full.push(p.id);
      [
        ...p.relatedProductIds,
        ...p.compatibleProductIds,
        ...p.accessoryIds,
      ].forEach((id) => ids.add(id));
      collect({ category: p.categoryId, pageSize: 5 });
    }
  } else if (pathname === "/products" || pathname === "/search") collect(q);
  else if (pathname.startsWith("/products/")) {
    const c = getCategories().find((c) => c.slug === pathname.slice(10));
    collect({ ...q, category: c?.id });
  } else if (
    ["/featured-products", "/new-products", "/popular-products"].includes(
      pathname,
    )
  )
    collect({
      ...q,
      collection:
        pathname === "/new-products"
          ? "new"
          : pathname === "/popular-products"
            ? "popular"
            : "featured",
    });
  else if (pathname.startsWith("/applications/")) {
    const app = getEntity<Application>("application", pathname.slice(14));
    collect({ ...q, application: app?.id });
  } else if (pathname.startsWith("/knowledge/")) {
    const a = getArticles().find((a) => a.slug === pathname.slice(11));
    if (a) {
      articles.push(a.id);
      fullArticles.push(a.id);
      collect({ category: a.relatedCategory, pageSize: 4 });
    }
  } else if (pathname === "/knowledge")
    getArticles().forEach((a) => articles.push(a.id));
  else if (pathname === "/quote") {
    for (const key of ["product", "products"])
      url.searchParams
        .get(key)
        ?.split(",")
        .slice(0, 10)
        .forEach((id) => ids.add(id));
  } else if (pathname === "/admin") {
    collect({
      query: typeof params.q === "string" ? params.q : undefined,
      page: Number(params.page) || 1,
      pageSize: 20,
    });
    getArticles().forEach((a) => articles.push(a.id));
  } else if (pathname.startsWith("/print")) return { allProducts: true };
  return {
    products: [...ids].slice(0, 220),
    fullProducts: full,
    articles,
    fullArticles,
  };
}
