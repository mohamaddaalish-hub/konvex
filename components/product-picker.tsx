"use client";
import { usePreferences } from "./preferences";
import { useI18n } from "@/i18n/use-i18n";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, LoaderCircle } from "lucide-react";
import type { ProductSummary } from "@/lib/types";
import { ProductImage } from "./ui";
export function ProductPicker({
  onSelect,
  selectedIds = [],
}: {
  onSelect: (p: ProductSummary) => void;
  selectedIds?: string[];
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { mergeDictionary } = usePreferences();
  const [q, setQ] = useState(""),
    [open, setOpen] = useState(false),
    [results, setResults] = useState<ProductSummary[]>([]),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const c = new AbortController();
    setPending(true);
    setActive(-1);
    setError("");
    const t = setTimeout(() => {
      fetch("/api/search?q=" + encodeURIComponent(q), {
        signal: c.signal,
        headers: { "x-konvex-locale": locale },
      })
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error();
          mergeDictionary(d.dictionary || {});
          setResults(d.products);
        })
        .catch((e) => {
          if (e.name !== "AbortError")
            setError(
              tr("جستجو انجام نشد. عبارت را تغییر دهید و دوباره تلاش کنید."),
            );
        })
        .finally(() => {
          if (!c.signal.aborted) setPending(false);
        });
    }, 200);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [q, open]);
  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);
  const available = results.filter((p) => !selectedIds.includes(p.id));
  function choose(p: ProductSummary) {
    onSelect(p);
    setQ("");
    setOpen(false);
  }
  return (
    <div className="product-picker" ref={box}>
      <div className="product-picker-input">
        <Search size={18} />
        <input
          aria-label={tr("جستجو و افزودن محصول به درخواست")}
          role="combobox"
          aria-expanded={open}
          aria-controls="quote-product-options"
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `quote-option-${active}` : undefined
          }
          placeholder={tr("نام یا مدل محصول را جستجو و اضافه کنید…")}
          maxLength={200}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((v) => Math.min(available.length - 1, v + 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((v) => Math.max(-1, v - 1));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (active >= 0 && available[active]) choose(available[active]);
            }
          }}
        />
        {pending && <LoaderCircle size={18} className="spin" />}
      </div>
      {open && (
        <div
          className="product-picker-results"
          id="quote-product-options"
          role="listbox"
          aria-label={tr("انتخاب محصول")}
        >
          {pending ? (
            <p>{tr("در حال جستجو…")}</p>
          ) : error ? (
            <p role="alert">{tr(error)}</p>
          ) : available.length ? (
            available.map((p, i) => (
              <button
                key={p.id}
                type="button"
                id={`quote-option-${i}`}
                role="option"
                aria-selected={active === i}
                className={active === i ? "active" : ""}
                onClick={() => choose(p)}
              >
                <ProductImage
                  src={p.images[0]?.url || "/images/hero.webp"}
                  alt=""
                  sizes="50px"
                />
                <span>
                  {tr(p.name)}
                  <bdi>{tr(p.model)}</bdi>
                </span>
                <Plus size={17} />
              </button>
            ))
          ) : (
            <p>
              {tr("محصول دیگری پیدا نشد. مدل یا نام کوتاه‌تری را امتحان کنید.")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
