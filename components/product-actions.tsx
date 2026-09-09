"use client";
import { useI18n } from "@/i18n/use-i18n";

import Link from "@/i18n/navigation";
import { ArrowLeft, MessageCircle, Share2 } from "lucide-react";
import type { ProductSummary } from "@/lib/types";
import { WishlistButton, CompareButton, useStore } from "./store";
import { track } from "@/lib/analytics";
export function ProductActions({ product }: { product: ProductSummary }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { toast } = useStore();
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(tr("لینک محصول کپی شد."));
    } catch {
      toast(tr("برای اشتراک‌گذاری، آدرس صفحه را از مرورگر کپی کنید."));
    }
  }
  return (
    <>
      <div className="product-primary-actions">
        <Link className="button primary" href={`/quote?product=${product.id}`}>
          {tr("درخواست قیمت")}
          <ArrowLeft size={19} />
        </Link>
        <Link
          className="button secondary"
          href={`/quote?product=${product.id}&purpose=consultation`}
          onClick={() => track("contact_click", { product_id: product.id })}
        >
          <MessageCircle size={18} />
          {tr("مشاوره")}
        </Link>
      </div>
      <div className="product-secondary-actions">
        <CompareButton product={product} />
        <WishlistButton product={product} label />
        <button
          className="icon-button"
          onClick={share}
          aria-label={tr("کپی لینک محصول")}
        >
          <Share2 size={17} />
        </button>
      </div>
      <div className="mobile-product-cta">
        <span>
          <bdi>{tr(product.model)}</bdi>
          <small>{tr("قیمت و موجودی با استعلام")}</small>
        </span>
        <Link className="button primary" href={`/quote?product=${product.id}`}>
          {tr("درخواست قیمت")}
          <ArrowLeft size={18} />
        </Link>
      </div>
    </>
  );
}
export function DocumentDownload({
  href,
  name,
  label,
}: {
  href: string;
  name: string;
  label: React.ReactNode;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <a
      href={
        locale === "en" && href.startsWith("/api/")
          ? href + (href.includes("?") ? "&" : "?") + "locale=en"
          : href
      }
      className="document-download"
      download
      onClick={() => track("download_catalog", { document: name })}
    >
      {label}
    </a>
  );
}
