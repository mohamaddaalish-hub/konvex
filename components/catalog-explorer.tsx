"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useState, useEffect, useTransition } from "react";
import Link from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  Search,
  ArrowLeft,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  ArrowUpLeft,
} from "lucide-react";
import type {
  CatalogResult,
  Category,
  QueryOptions,
  Facet,
  ProductSummary,
} from "@/lib/types";
import { faNumber, isTechnical } from "@/lib/format";
import { ProductGrid } from "./product-card";
import { Modal } from "./modal";
import { EmptyState } from "./ui";
import { track } from "@/lib/analytics";
import { useStore } from "./store";
type Selected = Record<string, string[]>;
function Filters({
  facets,
  selected,
  onChange,
}: {
  facets: Facet[];
  selected: Selected;
  onChange: (key: string, value: string) => void;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { ready } = useStore();
  return (
    <div className="filter-groups">
      {facets
        .filter((f) => f.options.length > 0)
        .map((f, index) => (
          <details key={f.key} open={index < 4} className="filter-group">
            <summary>
              {tr(f.label)}
              <span>
                {tr(
                  selected[f.key]?.length
                    ? fmtNumber(selected[f.key].length)
                    : null,
                )}
                <ChevronDown size={15} />
              </span>
            </summary>
            <div>
              {f.options.map((o) => {
                const checked = selected[f.key]?.includes(o.value) || false;
                return (
                  <label
                    className={`filter-option ${o.count === 0 && !checked ? "unavailable" : ""}`}
                    key={o.value}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onChange(f.key, o.value)}
                      disabled={!ready || (o.count === 0 && !checked)}
                    />
                    <span
                      dir={
                        locale === "en" || isTechnical(o.label || o.value)
                          ? "ltr"
                          : "rtl"
                      }
                    >
                      {tr(o.label || o.value)}
                    </span>
                    <small>{fmtNumber(o.count)}</small>
                  </label>
                );
              })}
            </div>
          </details>
        ))}
    </div>
  );
}
export function CatalogExplorer({
  result,
  categories,
  category,
  options,
  suggestions = [],
}: {
  result: CatalogResult;
  categories: Category[];
  category?: Category;
  options: QueryOptions;
  suggestions?: ProductSummary[];
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const router = useRouter(),
    pathname = usePathname(),
    params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [localFilters, setLocalFilters] = useState<Selected>(
    options.filters || {},
  );
  const selected = localFilters;
  useEffect(() => {
    setLocalFilters(options.filters || {});
  }, [options.filters]);
  const [input, setInput] = useState(options.query || ""),
    [drawer, setDrawer] = useState(false),
    [draft, setDraft] = useState<Selected>({});
  const count = Object.values(selected).reduce((n, a) => n + a.length, 0),
    list = params.get("view") === "list";
  useEffect(() => {
    setInput(options.query || "");
  }, [options.query]);
  function navigate(next: URLSearchParams, scroll = false) {
    startTransition(() =>
      router.push(`${pathname}${next.size ? "?" + next.toString() : ""}`, {
        scroll,
      }),
    );
  }
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(next);
  }
  function toggle(key: string, value: string) {
    const values = selected[key] || [];
    const nextSelected = {
      ...selected,
      [key]: values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    };
    setLocalFilters(nextSelected);
    const next = new URLSearchParams(params.toString());
    Array.from(next.keys())
      .filter((k) => k.startsWith("f."))
      .forEach((k) => next.delete(k));
    Object.entries(nextSelected).forEach(([k, vals]) =>
      vals.forEach((v) => next.append("f." + k, v)),
    );
    next.delete("page");
    navigate(next);
    track("filter_used", { category: category?.id || "all", attribute: key });
  }
  function clear() {
    setLocalFilters({});
    const next = new URLSearchParams(params.toString());
    Array.from(next.keys())
      .filter((k) => k.startsWith("f."))
      .forEach((k) => next.delete(k));
    next.delete("page");
    navigate(next);
  }
  function apply() {
    setLocalFilters(draft);
    const next = new URLSearchParams(params.toString());
    Array.from(next.keys())
      .filter((k) => k.startsWith("f."))
      .forEach((k) => next.delete(k));
    Object.entries(draft).forEach(([k, vals]) =>
      vals.forEach((v) => next.append("f." + k, v)),
    );
    next.delete("page");
    navigate(next);
    setDrawer(false);
    track("filter_used", {
      category: category?.id || "all",
      attribute: "mobile_filters",
    });
  }
  function pageHref(page: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    return `${pathname}?${next}`;
  }
  const pageNumbers = Array.from(
    { length: result.pages },
    (_, i) => i + 1,
  ).filter(
    (p) => p === 1 || p === result.pages || Math.abs(p - result.page) <= 2,
  );
  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar">
        <div className="sidebar-heading">
          <SlidersHorizontal size={18} />
          <h2>{tr("فیلتر محصولات")}</h2>
          {count > 0 && <button onClick={clear}>{tr("پاک کردن")}</button>}
        </div>
        <div className="sidebar-categories">
          <h3>{tr("دسته‌بندی محصولات")}</h3>
          <Link className={!category ? "active" : ""} href="/products">
            {tr("همه محصولات")}
            <small>
              {fmtNumber(categories.reduce((n, c) => n + (c.count || 0), 0))}
            </small>
          </Link>
          {categories.map((c) => (
            <Link
              className={c.id === category?.id ? "active" : ""}
              href={`/products/${c.slug}`}
              key={c.id}
            >
              {tr(c.name)}
              <small>{fmtNumber(c.count || 0)}</small>
            </Link>
          ))}
        </div>
        <Filters facets={result.facets} selected={selected} onChange={toggle} />
        <div className="filter-help">
          <span className="eyebrow">{tr("مطمئن نیستید؟")}</span>
          <h3>{tr("از نیازتان شروع کنید.")}</h3>
          <p>{tr("شرایط کار را بنویسید تا مسیر انتخاب روشن‌تر شود.")}</p>
          <Link className="text-link" href="/quote?purpose=consultation">
            {tr("درخواست مشاوره")}
            <ArrowUpLeft size={16} />
          </Link>
        </div>
      </aside>
      <div className="catalog-main">
        <div className="catalog-toolbar">
          <form
            className="catalog-search"
            onSubmit={(e) => {
              e.preventDefault();
              update("q", input.trim());
              track("product_search", {
                query_length: input.length,
                category: category?.id || "all",
              });
            }}
          >
            <Search size={18} />
            <input
              aria-label={tr(
                category ? tr("جستجو در این دسته") : tr("جستجو در محصولات"),
              )}
              placeholder={tr(
                category
                  ? tr("جستجو در این دسته…")
                  : tr("نام، مدل یا مشخصه فنی…"),
              )}
              value={input}
              maxLength={200}
              onChange={(e) => setInput(e.target.value)}
            />
            {input && (
              <button
                type="button"
                className="icon-button"
                aria-label={tr("پاک کردن عبارت جستجو")}
                onClick={() => {
                  setInput("");
                  update("q", "");
                }}
              >
                <X size={15} />
              </button>
            )}
            <button
              type="submit"
              className="icon-button"
              aria-label={tr("اجرای جستجو")}
            >
              <ArrowLeft size={17} />
            </button>
          </form>
          <div className="catalog-sort">
            <label htmlFor="sort-select">{tr("مرتب‌سازی:")}</label>
            <select
              aria-label={tr("مرتب‌سازی محصولات")}
              id="sort-select"
              value={options.sort || "featured"}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="featured">{tr("پیشنهاد کانوکس")}</option>
              <option value="newest">{tr("جدیدترین")}</option>
              <option value="name">{tr("نام محصول")}</option>
              <option value="popular">{tr("ترتیب محبوبیت نمونه")}</option>
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="view-toggle">
            <button
              aria-label={tr("نمایش شبکه‌ای")}
              aria-pressed={!list}
              className={!list ? "active" : ""}
              onClick={() => update("view", "")}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              aria-label={tr("نمایش فهرستی")}
              aria-pressed={list}
              className={list ? "active" : ""}
              onClick={() => update("view", "list")}
            >
              <List size={20} />
            </button>
          </div>
        </div>
        <div className="catalog-result-line">
          <span aria-live="polite">
            {pending ? (
              <>
                <LoaderCircle size={14} className="spin" />
                {tr("در حال به‌روزرسانی…")}
              </>
            ) : (
              <>
                {fmtNumber(result.total)}
                {tr(" محصول")}
                {options.query && (
                  <>
                    {tr(" برای «")}
                    {tr(options.query)}»
                  </>
                )}
              </>
            )}
          </span>
          <button
            className="mobile-filter-trigger button secondary small"
            onClick={() => {
              setDraft(structuredClone(selected));
              setDrawer(true);
            }}
          >
            <SlidersHorizontal size={16} />
            {tr("فیلترها")}
            {count > 0 && (
              <span className="inline-count">{fmtNumber(count)}</span>
            )}
          </button>
          <span className="catalog-sample-label">{tr("کاتالوگ نمونه")}</span>
        </div>
        {count > 0 && (
          <div className="active-filters">
            {Object.entries(selected).flatMap(([key, vals]) =>
              vals.map((value) => {
                const facet = result.facets.find((f) => f.key === key);
                const label =
                  facet?.options.find((o) => o.value === value)?.label || value;
                return (
                  <button
                    className="active-filter"
                    key={`${key}-${value}`}
                    onClick={() => toggle(key, value)}
                    aria-label={tr("حذف فیلتر {v0} {v1}", {
                      v0: tr(facet?.label || key),
                      v1: tr(label),
                    })}
                  >
                    <span>
                      {tr(facet?.label || key)}: <bdi>{tr(label)}</bdi>
                    </span>
                    <X size={13} />
                  </button>
                );
              }),
            )}
            <button className="clear-filters" onClick={clear}>
              {tr("حذف همه")}
            </button>
          </div>
        )}
        <h2 className="sr-only">{tr("فهرست محصولات")}</h2>
        <div
          className={`catalog-result-body ${pending ? "is-pending" : ""}`}
          aria-busy={pending}
        >
          {result.products.length ? (
            <ProductGrid products={result.products} list={list} prioritize />
          ) : (
            <>
              <EmptyState
                search
                title={tr(
                  options.query
                    ? tr("محصول موردنظر پیدا نشد.")
                    : tr("محصولی با این مشخصات پیدا نشد."),
                )}
                description={tr(
                  "عبارت کوتاه‌تر یا فیلترهای کمتری را امتحان کنید. اگر به راهنمایی نیاز دارید، درخواست مشاوره ثبت کنید.",
                )}
              >
                <div className="empty-actions">
                  {count > 0 ? (
                    <button className="button primary" onClick={clear}>
                      {tr("پاک کردن فیلترها")}
                    </button>
                  ) : (
                    <Link className="button primary" href="/products">
                      {tr("همه محصولات")}
                      <ArrowLeft size={17} />
                    </Link>
                  )}
                  <Link
                    className="button secondary"
                    href="/quote?purpose=consultation"
                  >
                    {tr("درخواست مشاوره")}
                  </Link>
                </div>
              </EmptyState>
              {suggestions.length > 0 && (
                <div className="search-related">
                  <h2>{tr("این محصولات را هم بررسی کنید")}</h2>
                  <ProductGrid products={suggestions} />
                </div>
              )}
            </>
          )}
        </div>
        {result.pages > 1 && (
          <nav className="pagination" aria-label={tr("صفحه‌های محصولات")}>
            {result.page > 1 ? (
              <Link href={pageHref(result.page - 1)} className="page-nav">
                <ChevronRight size={17} />
                {tr("قبلی")}
              </Link>
            ) : (
              <span className="page-nav disabled" aria-disabled="true">
                <ChevronRight size={17} />
                {tr("قبلی")}
              </span>
            )}
            <div>
              {pageNumbers.map((p, i) => (
                <span key={p}>
                  {i > 0 && p - pageNumbers[i - 1] > 1 && (
                    <span className="pagination-gap">…</span>
                  )}
                  <Link
                    href={pageHref(p)}
                    className={p === result.page ? "current" : ""}
                    aria-current={p === result.page ? "page" : undefined}
                  >
                    {fmtNumber(p)}
                  </Link>
                </span>
              ))}
            </div>
            {result.page < result.pages ? (
              <Link href={pageHref(result.page + 1)} className="page-nav">
                {tr("بعدی")}
                <ChevronLeft size={17} />
              </Link>
            ) : (
              <span className="page-nav disabled" aria-disabled="true">
                {tr("بعدی")}
                <ChevronLeft size={17} />
              </span>
            )}
          </nav>
        )}
      </div>
      <Modal
        open={drawer}
        onClose={() => setDrawer(false)}
        title={tr("فیلتر محصولات")}
        className="filter-modal"
      >
        <div className="filter-drawer-body">
          <p className="muted small">{tr("مشخصات موردنیاز را انتخاب کنید.")}</p>
          <Filters
            facets={result.facets}
            selected={draft}
            onChange={(key, value) =>
              setDraft((prev) => ({
                ...prev,
                [key]: prev[key]?.includes(value)
                  ? prev[key].filter((v) => v !== value)
                  : [...(prev[key] || []), value],
              }))
            }
          />
        </div>
        <div className="drawer-actions">
          <button className="button primary" onClick={apply}>
            {tr("اعمال فیلترها")}
            <ArrowLeft size={17} />
          </button>
          <button className="button secondary" onClick={() => setDraft({})}>
            {tr("پاک کردن")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
