import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import type { ProductSummary } from "@/lib/types";
import { isTechnical, faNumber } from "@/lib/format";
import { ProductImage } from "./ui";
import { CompareButton, WishlistButton, QuickViewButton } from "./store";
export function ProductCard({
  product,
  prominent = false,
}: {
  product: ProductSummary;
  prominent?: boolean;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const p = product;
  return (
    <article className="product-card">
      <div className="product-card-visual">
        <Link
          href={`/product/${p.slug}`}
          aria-label={tr("مشاهده {v0}", { v0: tr(p.name) })}
          tabIndex={-1}
        >
          <ProductImage
            src={p.images[0]?.url || "/images/hero.webp"}
            alt={tr(p.images[0]?.alt || p.name)}
            eager={prominent}
          />
        </Link>
        {p.isNew ? (
          <span className="product-badge">{tr("جدید")}</span>
        ) : p.featured ? (
          <span className="product-badge neutral">{tr("منتخب کانوکس")}</span>
        ) : null}
        <WishlistButton product={p} />
        <QuickViewButton product={p} />
      </div>
      <div className="product-card-body">
        <div className="product-meta">
          <span className="product-brand" dir="ltr">
            {tr(p.brand)}
          </span>
          <bdi className="model">{tr(p.model)}</bdi>
        </div>
        <h3>
          <Link href={`/product/${p.slug}`}>{tr(p.name)}</Link>
        </h3>
        <div className="product-highlights">
          {p.specifications
            .filter((s) => s.highlight)
            .slice(0, 2)
            .map((s) => (
              <span key={s.key} title={tr(s.label)}>
                <bdi
                  dir={locale === "en" || isTechnical(s.value) ? "ltr" : "rtl"}
                >
                  {tr(s.value)}
                </bdi>
              </span>
            ))}
        </div>
        <div className="card-price">
          {p.price !== null ? (
            <>
              <b>{fmtNumber(p.price)}</b>
              {tr(" تومان")}
            </>
          ) : (
            <>
              {tr("قیمت با استعلام ")}
              <span className="tiny-dash" />
            </>
          )}
        </div>
        <div className="product-card-footer">
          <Link
            href={`/product/${p.slug}`}
            className="product-view-link"
            aria-label={tr("مشخصات محصول {v0}", { v0: tr(p.name) })}
          >
            <span className="product-link-full">{tr("مشخصات محصول")}</span>
            <span className="product-link-compact">{tr("مشخصات")}</span>
            <ArrowLeft size={17} />
          </Link>
          <CompareButton product={p} compact />
        </div>
      </div>
    </article>
  );
}
export function ProductGrid({
  products,
  list = false,
  prioritize = false,
}: {
  products: ProductSummary[];
  list?: boolean;
  prioritize?: boolean;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div className={`product-grid ${list ? "list-view" : ""}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} prominent={prioritize && i < 4} />
      ))}
    </div>
  );
}
