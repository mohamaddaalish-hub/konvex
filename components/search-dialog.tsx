"use client";
import { usePreferences } from "./preferences";
import { useI18n } from "@/i18n/use-i18n";

import { useEffect, useRef, useState } from "react";
import Link from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  Search,
  ArrowLeft,
  Clock3,
  X,
  LoaderCircle,
  PackageSearch,
} from "lucide-react";
import type { ProductSummary, Category } from "@/lib/types";
import { Modal } from "./modal";
import { ProductImage } from "./ui";
import { faNumber } from "@/lib/format";
import { track } from "@/lib/analytics";
type Results = {
  products: ProductSummary[];
  categories: Category[];
  total: number;
  suggested: ProductSummary[];
};
export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { mergeDictionary } = usePreferences();
  const [query, setQuery] = useState(""),
    [result, setResult] = useState<Results | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [recent, setRecent] = useState<string[]>([]),
    [active, setActive] = useState(-1),
    [retry, setRetry] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (open) {
      try {
        setRecent(
          JSON.parse(localStorage.getItem("kv-searches") || "[]")
            .filter((x: unknown) => typeof x === "string")
            .slice(0, 5),
        );
      } catch {}
      setTimeout(() => input.current?.focus(), 60);
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setPending(true);
    setError("");
    setActive(-1);
    const t = setTimeout(
      async () => {
        try {
          const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
            headers: { "x-konvex-locale": locale },
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          mergeDictionary(d.dictionary || {});
          setResult(d);
        } catch (e) {
          if (e instanceof Error && e.name !== "AbortError")
            setError(tr("ارتباط با سرور برقرار نشد. دوباره تلاش کنید."));
        } finally {
          if (!controller.signal.aborted) setPending(false);
        }
      },
      query ? 220 : 0,
    );
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, open, retry]);
  function remember(q: string) {
    if (!q.trim()) return;
    const next = [q.trim(), ...recent.filter((v) => v !== q.trim())].slice(
      0,
      5,
    );
    setRecent(next);
    try {
      localStorage.setItem("kv-searches", JSON.stringify(next));
    } catch {}
    track("product_search", {
      query_length: q.length,
      result_count: result?.total || 0,
    });
  }
  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    remember(query);
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }
  function key(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((v) => Math.min((result?.products.length || 0) - 1, v + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((v) => Math.max(-1, v - 1));
    } else if (e.key === "Enter" && active >= 0 && result?.products[active]) {
      e.preventDefault();
      remember(query);
      onClose();
      router.push(`/product/${result.products[active].slug}`);
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("چه ابزاری نیاز دارید؟")}
      className="search-modal"
    >
      <form onSubmit={submit} className="search-dialog-form">
        <Search size={22} />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={key}
          placeholder={tr("نام محصول، مدل یا مشخصه فنی…")}
          aria-label={tr("جستجوی محصولات")}
          role="combobox"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={!!result && !pending}
          aria-activedescendant={
            active >= 0 ? `search-option-${active}` : undefined
          }
          autoComplete="off"
          maxLength={200}
        />
        {pending ? (
          <LoaderCircle className="spin" size={20} />
        ) : query ? (
          <button
            type="button"
            className="icon-button"
            aria-label={tr("پاک کردن جستجو")}
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
          >
            <X size={18} />
          </button>
        ) : (
          <kbd>ESC</kbd>
        )}
      </form>
      <div className="search-content">
        {!query && recent.length > 0 && (
          <div className="recent-searches">
            <div className="small-section-title">
              <span>
                <Clock3 size={16} />
                {tr("جستجوهای اخیر")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setRecent([]);
                  localStorage.removeItem("kv-searches");
                }}
              >
                {tr("پاک کردن")}
              </button>
            </div>
            <div className="chips">
              {recent.map((r) => (
                <button className="chip" key={r} onClick={() => setQuery(r)}>
                  {tr(r)}
                </button>
              ))}
            </div>
          </div>
        )}
        {error ? (
          <div className="search-error" role="alert">
            <p>{tr(error)}</p>
            <button
              className="button secondary small"
              onClick={() => setRetry((v) => v + 1)}
            >
              {tr("تلاش مجدد")}
            </button>
          </div>
        ) : (
          <>
            {pending ? (
              <div className="search-skeleton" aria-label={tr("در حال جستجو")}>
                {[0, 1, 2].map((n) => (
                  <div key={n} className="skeleton" />
                ))}
              </div>
            ) : (
              result && (
                <>
                  {result.products.length === 0 ? (
                    <div className="search-no-result">
                      <PackageSearch size={36} />
                      <h3>{tr("محصول موردنظر پیدا نشد.")}</h3>
                      <p>
                        {tr(
                          "نام کوتاه‌تر، کد مدل یا مشخصه‌ای مثل «۶۰ متر» را امتحان کنید.",
                        )}
                      </p>
                      <Link
                        href="/quote?purpose=consultation"
                        onClick={onClose}
                        className="text-link"
                      >
                        {tr("برای انتخاب محصول راهنمایی می‌خواهم")}
                        <ArrowLeft size={17} />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="small-section-title">
                        <span>
                          {tr(
                            query ? tr("محصولات مرتبط") : tr("پیشنهاد کانوکس"),
                          )}
                        </span>
                        <span>
                          {fmtNumber(result.total)}
                          {tr(" محصول")}
                        </span>
                      </div>
                      <div
                        id="search-suggestions"
                        role="listbox"
                        aria-label={tr("پیشنهادهای محصول")}
                      >
                        {result.products.map((p, i) => (
                          <Link
                            key={p.id}
                            role="option"
                            aria-selected={active === i}
                            id={`search-option-${i}`}
                            className={`search-result ${active === i ? "active" : ""}`}
                            href={`/product/${p.slug}`}
                            onClick={() => {
                              remember(query);
                              onClose();
                            }}
                          >
                            <ProductImage
                              src={p.images[0]?.url || "/images/hero.webp"}
                              alt=""
                              sizes="64px"
                            />
                            <div>
                              <strong>{tr(p.name)}</strong>
                              <bdi>{tr(p.model)}</bdi>
                            </div>
                            <ArrowLeft size={18} />
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                  {result.categories.length > 0 && (
                    <div className="search-categories">
                      <div className="small-section-title">
                        {tr("دسته‌بندی‌ها")}
                      </div>
                      <div className="chips">
                        {result.categories.map((c) => (
                          <Link
                            key={c.id}
                            className="chip"
                            href={`/products/${c.slug}`}
                            onClick={onClose}
                          >
                            {tr(c.name)}
                            <ArrowLeft size={14} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.suggested.length > 0 && (
                    <>
                      <div className="small-section-title">
                        {tr("شاید این محصولات مناسب باشند")}
                      </div>
                      {result.suggested.map((p) => (
                        <Link
                          className="search-result"
                          href={`/product/${p.slug}`}
                          onClick={onClose}
                          key={p.id}
                        >
                          <ProductImage
                            src={p.images[0]?.url || "/images/hero.webp"}
                            alt=""
                            sizes="64px"
                          />
                          <div>
                            <strong>{tr(p.name)}</strong>
                            <bdi>{tr(p.model)}</bdi>
                          </div>
                          <ArrowLeft size={18} />
                        </Link>
                      ))}
                    </>
                  )}
                </>
              )
            )}
          </>
        )}
      </div>
      <div className="search-dialog-footer">
        <span>{tr("جستجو بر اساس نام، مدل، کد و مشخصات فنی")}</span>
        <button className="text-link" onClick={() => submit()}>
          {tr("نمایش همه نتایج")}
          <ArrowLeft size={16} />
        </button>
      </div>
    </Modal>
  );
}
