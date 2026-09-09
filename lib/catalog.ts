import {
  products as seedProducts,
  categories as seedCategories,
  brands as seedBrands,
  applications as seedApplications,
  articles as seedArticles,
  settings as seedSettings,
} from "@/data/seed";
import { normalizeSearch } from "./format";
import contentSeed from "@/data/translations/en-content.json";
import type {
  Product, ProductSummary, Category, Brand, Application, Article,
  SiteSettings, QueryOptions, CatalogResult, Facet,
} from "./types";

type TranslationField = { source: string; text: string };
type TranslationRecord = { type: string; id: string; fields: Record<string, TranslationField> };

const products = seedProducts as Product[];
const categories = seedCategories as Category[];
const brands = seedBrands as Brand[];
const applications = seedApplications as Application[];
const articles = seedArticles as Article[];
const settings = seedSettings as SiteSettings;

export const summary = (p: Product): ProductSummary => ({
  id: p.id, slug: p.slug, sku: p.sku, name: p.name, model: p.model,
  brand: p.brand, categoryId: p.categoryId, shortDescription: p.shortDescription,
  specifications: p.specifications, images: p.images, featured: p.featured,
  isNew: p.isNew, price: p.price, availability: p.availability, isSample: p.isSample,
});

export function getEntities<T>(type: string): T[] {
  switch (type) {
    case "category": return categories.slice().sort((a,b) => a.order-b.order) as T[];
    case "brand": return brands as T[];
    case "application": return applications as T[];
    case "article": return articles.slice().sort((a,b) => a.publishedAt < b.publishedAt ? 1 : -1) as T[];
    default: return [];
  }
}

export function getEntity<T>(type: string, slug: string): T | undefined {
  return getEntities<T>(type).find((x: any) => x.slug === slug || x.id === slug);
}

export function categoryIds(root: string, all = categories): string[] {
  const found = new Set<string>();
  const visit = (id: string) => {
    if (found.has(id)) return;
    found.add(id);
    all.filter(c => c.parentId === id).forEach(c => visit(c.id));
  };
  visit(root);
  return [...found];
}

export function getCategories(): Category[] {
  return categories.map(c => ({
    ...c,
    count: categoryIds(c.id).reduce((n,id) => n + products.filter(p => p.categoryId === id).length, 0),
  }));
}
export const getBrands = () => brands;
export const getApplications = () => applications;
export const getArticles = () => articles;
export const getSettings = (): SiteSettings => settings;

export function getProduct(slugOrId: string): Product | undefined {
  return products.find(p => p.slug === slugOrId || p.id === slugOrId);
}
export function getProductsByIds(ids: string[]): ProductSummary[] {
  return ids.slice(0,50).map(getProduct).filter((p): p is Product => !!p).map(summary);
}
export function getAllProducts(): Product[] { return products; }

function textFor(p: Product): string {
  return normalizeSearch([
    p.id,p.slug,p.sku,p.name,p.model,p.brand,p.categoryId,p.subcategory,
    p.shortDescription,p.longDescription,...p.tags,...p.features,
    ...p.specifications.flatMap(s => [s.key,s.label,s.value]),
    ...p.applications
  ].join(" "));
}

function matches(options: QueryOptions, p: Product, omit?: string): boolean {
  if (options.category && !categoryIds(options.category).includes(p.categoryId)) return false;
  if (options.application && !p.applications.includes(options.application)) return false;
  if (options.collection === "featured" && !p.featured) return false;
  if (options.collection === "new" && !p.isNew) return false;
  if (options.collection === "popular" && p.popularityRank < 7) return false;
  if (options.brand?.length && !options.brand.includes(p.brandId)) return false;
  if (options.query) {
    const q = normalizeSearch(options.query).split(" ").filter(Boolean).slice(0,12);
    const haystack = textFor(p);
    if (!q.every(t => haystack.includes(t))) return false;
  }
  for (const [key, values] of Object.entries(options.filters || {})) {
    if (omit === key || !values?.length) continue;
    if (key === "brand" && !values.includes(p.brandId)) return false;
    else if (key === "application" && !values.some(v => p.applications.includes(v))) return false;
    else {
      const vals = p.specifications.filter(s => s.key === key).map(s => s.value);
      if (!values.some(v => vals.includes(v))) return false;
    }
  }
  return true;
}

export function queryProducts(options: QueryOptions = {}): CatalogResult {
  let list = products.filter(p => matches(options,p));
  if (options.sort === "newest") list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  else if (options.sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  else if (options.sort === "popular") list.sort((a,b) => b.popularityRank-a.popularityRank);
  else list.sort((a,b) => Number(b.featured)-Number(a.featured) || b.popularityRank-a.popularityRank || b.createdAt.localeCompare(a.createdAt));

  const pageSize = Math.max(1, Math.min(48, options.pageSize || 12));
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total/pageSize));
  const page = Math.max(1, Math.min(pages, options.page || 1));
  const pageItems = list.slice((page-1)*pageSize, page*pageSize);

  const category = options.category ? getEntity<Category>("category", options.category) : undefined;
  const definitions = [
    {key:"brand",label:"برند"},
    ...(category?.filters || []),
    {key:"application",label:"کاربرد"}
  ];
  const facets: Facet[] = definitions.map(f => {
    const rows = new Map<string,number>();
    products.filter(p => matches({...options, page:undefined}, p, f.key)).forEach(p => {
      if (f.key === "brand") rows.set(p.brandId,(rows.get(p.brandId)||0)+1);
      else if (f.key === "application") p.applications.forEach(v => rows.set(v,(rows.get(v)||0)+1));
      else p.specifications.filter(s => s.key===f.key).forEach(s => rows.set(s.value,(rows.get(s.value)||0)+1));
    });
    const selected = options.filters?.[f.key] || [];
    for (const v of selected) if (!rows.has(v)) rows.set(v,0);
    return {
      ...f,
      options: [...rows.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([value,count])=>({
        value,count,
        label: f.key==="brand" ? brands.find(b=>b.id===value)?.name || value :
          f.key==="application" ? applications.find(a=>a.id===value)?.name || value : value
      }))
    };
  });
  return {products: pageItems.map(summary), total, page, pages, pageSize, facets};
}

export function parseQuery(params: Record<string,string|string[]|undefined>): QueryOptions {
  const scalar = (k:string) => Array.isArray(params[k]) ? params[k]![0] : params[k];
  const filters: Record<string,string[]> = {};
  for (const key of Object.keys(params)) if (key.startsWith("f.")) {
    const val=params[key]; if (val) filters[key.slice(2)] = (Array.isArray(val)?val:[val]).slice(0,20).map(v=>v.slice(0,150));
  }
  return { query: scalar("q")?.slice(0,200), sort: scalar("sort"), page: Math.max(1,parseInt(scalar("page")||"1")||1), filters };
}

// Public/demo mode is intentionally read-only on Vercel. Admin persistence remains SQLite-backed
// and should be moved to a hosted database before enabling production admin writes.
export function saveProduct(_product: Product) { return; }
export function deleteProduct(_id: string) { return; }
export function saveEntity(_type: string, _entity: {id:string;slug?:string;order?:number}) { return; }

export function getSeedTranslations(): TranslationRecord[] {
  return contentSeed as unknown as TranslationRecord[];
}
