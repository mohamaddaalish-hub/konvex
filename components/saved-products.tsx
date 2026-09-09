"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useStore } from "./store";
import { ProductGrid } from "./product-card";
import { SectionHeading, EmptyState } from "./ui";
import Link from "@/i18n/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { faNumber } from "@/lib/format";
export function RecentProducts({ excludeId }: { excludeId?: string }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { recent, ready } = useStore();
  const products = recent.filter((p) => p.id !== excludeId).slice(0, 4);
  if (!ready || !products.length) return null;
  return (
    <section className="section recent-section">
      <div className="container">
        <SectionHeading
          eyebrow={tr("ادامه مسیر انتخاب")}
          title={tr("اخیراً دیده‌اید")}
        />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
export function WishlistPageContent() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { wishlist, ready } = useStore();
  return (
    <>
      <div className="page-title-row">
        <div className="page-title">
          <span className="eyebrow">
            <span />
            {tr("فهرست شخصی شما")}
          </span>
          <h1>{tr("محصولات ذخیره‌شده")}</h1>
          <p>
            {tr(
              "انتخاب‌های خود را نگه دارید و هر زمان آماده بودید، دوباره بررسی کنید.",
            )}
          </p>
        </div>
        <span className="result-count">
          {fmtNumber(wishlist.length)}
          {tr(" محصول")}
        </span>
      </div>
      {!ready ? (
        <div className="product-grid">
          {[0, 1, 2, 3].map((n) => (
            <div className="skeleton product-skeleton" key={n} />
          ))}
        </div>
      ) : wishlist.length ? (
        <>
          <ProductGrid products={wishlist} />
          <p className="privacy-hint">
            <Heart size={16} />
            {tr(
              "این فهرست فقط در همین مرورگر ذخیره می‌شود و به حساب کاربری متصل نیست.",
            )}
          </p>
        </>
      ) : (
        <EmptyState
          title={tr("هنوز محصولی ذخیره نکرده‌اید.")}
          description={tr(
            "با انتخاب نشان قلب روی هر محصول، آن را به این فهرست اضافه کنید.",
          )}
          actionLabel={tr("پیدا کردن محصول مناسب")}
        />
      )}
    </>
  );
}
