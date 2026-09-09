"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useState, useRef } from "react";
import Link from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowUpLeft,
  Building2,
  Factory,
  Blocks,
  Sparkles,
  Settings2,
  Hammer,
  Download,
} from "lucide-react";
import type { ProductSummary, Application, Category } from "@/lib/types";
import { ProductGrid } from "./product-card";
import { ProductImage, SectionHeading } from "./ui";
import { track } from "@/lib/analytics";
export function HomeProducts({
  featured,
  newProducts,
  popular,
}: {
  featured: ProductSummary[];
  newProducts: ProductSummary[];
  popular: ProductSummary[];
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [tab, setTab] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const sets = [featured, newProducts, popular],
    tabs = [tr("منتخب کانوکس"), tr("تازه‌واردها"), tr("پرطرفدارها")],
    links = ["/featured-products", "/new-products", "/popular-products"];
  return (
    <section className="section featured-section">
      <div className="container">
        <SectionHeading
          eyebrow={tr("انتخاب دقیق، کار حرفه‌ای")}
          title={tr("برای کارهای جدی ساخته شده‌اند.")}
          href={links[tab]}
          linkLabel={tr("همه محصولات")}
        >
          <div
            className="collection-tabs"
            role="tablist"
            aria-label={tr("مجموعه محصولات")}
          >
            {tabs.map((t, i) => (
              <button
                role="tab"
                id={`collection-tab-${i}`}
                aria-controls="home-products-panel"
                aria-selected={tab === i}
                tabIndex={tab === i ? 0 : -1}
                className={tab === i ? "active" : ""}
                key={t}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                onClick={() => setTab(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                    e.preventDefault();
                    const next =
                      (i +
                        (e.key ===
                        (locale === "en" ? "ArrowRight" : "ArrowLeft")
                          ? 1
                          : 2)) %
                      3;
                    setTab(next);
                    refs.current[next]?.focus();
                  }
                }}
              >
                {tr(t)}
              </button>
            ))}
          </div>
        </SectionHeading>
        <div
          id="home-products-panel"
          role="tabpanel"
          aria-labelledby={`collection-tab-${tab}`}
        >
          <ProductGrid products={sets[tab]} />
          {tab === 2 && (
            <p className="collection-note">
              {tr(
                "این چیدمان نمونه است و بر اساس آمار فروش یا بازدید واقعی نیست.",
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
const icons = {
  building: Building2,
  workshop: Hammer,
  factory: Factory,
  spark: Sparkles,
  blocks: Blocks,
  settings: Settings2,
};
export function ApplicationsFeature({
  applications,
  categories,
}: {
  applications: Application[];
  categories: Category[];
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [selected, setSelected] = useState(3);
  const a = applications[selected] || applications[0];
  return (
    <section className="applications-feature">
      <div className="container">
        <div className="applications-top">
          <div>
            <span className="eyebrow light">
              <span />
              {tr("از کارتان شروع کنید")}
            </span>
            <h2>
              {tr("ابزار را برای کارتان انتخاب کنید.")}
              <br />
              <span>{tr("نه برعکس.")}</span>
            </h2>
          </div>
          <p>
            {tr("لازم نیست نام همه ابزارها را بدانید.")}
            <br />
            {tr("کافی است بدانید چه کاری پیش رو دارید.")}
          </p>
        </div>
        <div
          className="application-tabs"
          role="tablist"
          aria-label={tr("انتخاب کاربرد")}
        >
          {applications.map((item, i) => {
            const Icon = icons[item.icon as keyof typeof icons] || Factory;
            return (
              <button
                key={item.id}
                id={`application-tab-${i}`}
                role="tab"
                aria-selected={i === selected}
                aria-controls="application-panel"
                tabIndex={i === selected ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                    e.preventDefault();
                    const next =
                      (i +
                        (e.key ===
                        (locale === "en" ? "ArrowRight" : "ArrowLeft")
                          ? 1
                          : applications.length - 1)) %
                      applications.length;
                    setSelected(next);
                    (
                      e.currentTarget.parentElement?.querySelectorAll("button")[
                        next
                      ] as HTMLButtonElement
                    )?.focus();
                  }
                }}
                onClick={() => setSelected(i)}
                className={i === selected ? "active" : ""}
              >
                <Icon size={21} />
                {tr(item.name)}
                <ArrowUpLeft size={15} />
              </button>
            );
          })}
        </div>
        <div
          className="application-panel"
          id="application-panel"
          role="tabpanel"
          aria-labelledby={`application-tab-${selected}`}
        >
          <div className="application-copy">
            <span className="english-label" dir="ltr">
              {tr(a.slug.toUpperCase())} / KONVEX SOLUTIONS
            </span>
            <h3>{tr(a.title)}</h3>
            <p>{tr(a.description)}</p>
            <div className="application-tags">
              {a.categories.slice(0, 3).map((id) => (
                <Link
                  href={`/products/${categories.find((c) => c.id === id)?.slug || id}`}
                  key={id}
                >
                  {tr(categories.find((c) => c.id === id)?.name)}
                  <ArrowUpLeft size={13} />
                </Link>
              ))}
            </div>
            <Link
              className="button light-button"
              href={`/applications/${a.slug}`}
            >
              {tr("محصولات مناسب ")}
              {tr(a.name)}
              <ArrowLeft size={18} />
            </Link>
          </div>
          <div className="application-image">
            <ProductImage
              src={a.image}
              alt={tr("تصویر مفهومی کاربرد ابزار در {v0}", { v0: tr(a.name) })}
              sizes="(max-width: 768px) 100vw, 55vw"
              width={1376}
              height={768}
            />
            <span className="image-caption">
              {tr("کار درست، با ابزار درست.")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
export function CatalogDownload({
  className = "button secondary",
}: {
  className?: string;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <a
      href={
        locale === "en"
          ? "/downloads/konvex-catalog-sample-en.pdf"
          : "/downloads/konvex-catalog-sample.pdf"
      }
      download
      className={className}
      onClick={() => track("download_catalog", { document: "sample-catalog" })}
    >
      <Download size={18} />
      {tr("دریافت کاتالوگ")}
    </a>
  );
}
