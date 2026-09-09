import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import { ArrowLeft, ChevronLeft, Search, PackageOpen } from "lucide-react";
import { imageSrcSet, brandImageSource } from "@/lib/format";
import { breadcrumbSchema, safeJson } from "@/lib/seo";
import type { ReactNode } from "react";
export function Brandmark({
  dark = false,
  small = false,
  name = "KONVEX",
  persian = "کانوکس",
}: {
  dark?: boolean;
  small?: boolean;
  name?: string;
  persian?: string;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <span
      className={`brandmark ${dark ? "on-dark" : ""} ${small ? "brandmark-small" : ""}`}
    >
      <span className="brand-wordmark" dir="ltr">
        {tr(name.slice(0, -1))}
        <span className="brand-x">{tr(name.slice(-1))}</span>
        <i />
      </span>
      <span className="brand-tagline">
        {locale === "fa" && (
          <>
            {tr(persian)}
            <span> / </span>
          </>
        )}
        {tr("ابزارِ کارِ حرفه‌ای")}
      </span>
    </span>
  );
}
export function ProductImage({
  src,
  alt,
  className = "",
  eager = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px",
  width = 800,
  height = 800,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  src = brandImageSource(src);
  return (
    <img
      src={src}
      srcSet={imageSrcSet(src)}
      sizes={sizes}
      alt={tr(alt)}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      width={width}
      height={height}
    />
  );
}
export function Breadcrumb({
  items,
}: {
  items: {
    name: string;
    href?: string;
  }[];
}) {
  const {
    siteUrl: canonicalBase,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = useI18n();
  const all = [{ name: tr("خانه"), href: "/" }, ...items];
  return (
    <>
      <nav aria-label={tr("مسیر صفحه")} className="breadcrumb">
        <ol>
          {all.map((item, index) => (
            <li key={index}>
              {item.href ? (
                <Link href={item.href}>{tr(item.name)}</Link>
              ) : (
                <span aria-current="page">{tr(item.name)}</span>
              )}
              {index < all.length - 1 && (
                <ChevronLeft size={12} aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson(
            breadcrumbSchema(
              all.map((i) => ({ ...i, name: tr(i.name) })),
              locale,
              canonicalBase,
            ),
          ),
        }}
      />
    </>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "مشاهده همه",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div className="section-heading">
      <div>
        {eyebrow && (
          <div className="eyebrow">
            <span />
            {tr(eyebrow)}
          </div>
        )}
        <h2>{tr(title)}</h2>
        {description && <p>{tr(description)}</p>}
      </div>
      <div className="section-heading-end">
        {children}
        {href && (
          <Link className="text-link" href={href}>
            {tr(linkLabel)}
            <ArrowLeft size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
export function EmptyState({
  title = "محصولی پیدا نشد.",
  description = "فیلترها را تغییر دهید یا از دسته‌بندی‌های دیگر کمک بگیرید.",
  actionHref = "/products",
  actionLabel = "مشاهده همه محصولات",
  children,
  search = false,
}: {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  search?: boolean;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {search ? <Search size={32} /> : <PackageOpen size={36} />}
      </div>
      <h2>{tr(title)}</h2>
      <p>{tr(description)}</p>
      {children || (
        <Link className="button secondary" href={actionHref}>
          {tr(actionLabel)}
          <ArrowLeft size={18} />
        </Link>
      )}
    </div>
  );
}
export function ConsultationCTA() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <section className="consultation-band">
      <div className="container consultation-inner">
        <div className="consultation-title">
          <span className="eyebrow light">
            {tr("یک انتخاب مطمئن، از یک گفت‌وگو شروع می‌شود.")}
          </span>
          <h2>
            {tr("برای انتخاب ابزار مناسب،")}
            <br className="mobile-only" />
            {tr(" کنار شما هستیم.")}
          </h2>
        </div>
        <Link className="button primary" href="/quote?purpose=consultation">
          {tr("درخواست مشاوره")}
          <ArrowLeft size={19} />
        </Link>
      </div>
    </section>
  );
}
export function SampleNotice({ compact = false }: { compact?: boolean }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div className={`sample-notice ${compact ? "compact" : ""}`}>
      <span className="sample-dot" />
      <p>
        {tr("کاتالوگ نمونه")}
        <span>
          {" "}
          {tr(
            "— تصاویر و مشخصات این نسخه نمایشی‌اند و پیش از سفارش باید تأیید شوند.",
          )}
        </span>
      </p>
    </div>
  );
}
