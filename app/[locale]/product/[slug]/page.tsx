import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { notFound } from "next/navigation";

import Link from "@/i18n/navigation";
import {
  ArrowLeft,
  Check,
  Info,
  FileText,
  Download,
  ShieldCheck,
  Package,
  MessageSquare,
  ScanLine,
  ChevronDown,
  ArrowUpLeft,
  Boxes,
} from "lucide-react";
import {
  getProduct,
  getCategories,
  getProductsByIds,
  getApplications,
  queryProducts,
  summary,
} from "@/lib/catalog";
import { safeJson, siteUrl } from "@/lib/seo";
import { localizedMetadata as metadata } from "@/i18n/metadata";
import { isTechnical, faNumber, brandImageSource } from "@/lib/format";
import { Breadcrumb, SectionHeading, SampleNotice } from "@/components/ui";
import { ProductGallery, ProductTabs } from "@/components/product-gallery";
import { ProductActions, DocumentDownload } from "@/components/product-actions";
import { ProductViewTracker } from "@/components/store";
import { ProductGrid } from "@/components/product-card";
import { RecentProducts } from "@/components/saved-products";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export async function generateMetadata({ params }: Props) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  const { slug } = await params,
    p = getProduct(slug);
  return metadata(
    p?.seoTitle || tr("محصول پیدا نشد"),
    p?.seoDescription || "",
    `/product/${slug}`,
  );
}
export default async function ProductPage({ params }: Props) {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = await getI18n();
  const { slug } = await params,
    p = getProduct(slug);
  if (!p) notFound();
  const category = getCategories().find((c) => c.id === p.categoryId);
  const ps = summary(p),
    apps = getApplications().filter((a) => p.applications.includes(a.id)),
    accessories = getProductsByIds(p.accessoryIds),
    related = p.relatedProductIds.length
      ? getProductsByIds(p.relatedProductIds)
      : queryProducts({ category: p.categoryId, pageSize: 5 })
          .products.filter((v) => v.id !== p.id)
          .slice(0, 4),
    compatible = getProductsByIds(p.compatibleProductIds);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tr(p.name),
    description: tr(p.shortDescription),
    sku: p.sku,
    model: p.model,
    productID: p.id,
    brand: { "@type": "Brand", name: p.brand },
    image: p.images.map((i) =>
      new URL(brandImageSource(i.url), siteUrl).toString(),
    ),
    url: new URL(localizedPath(`/product/${p.slug}`), siteUrl).toString(),
    category: tr(category?.name),
    additionalProperty: p.specifications.map((s) => ({
      "@type": "PropertyValue",
      name: tr(s.label),
      value: tr(s.value),
    })),
  };
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <>
          <div className="container product-page">
            <Breadcrumb
              items={[
                { name: tr("محصولات"), href: "/products" },
                {
                  name: category?.name || tr("دسته"),
                  href: `/products/${category?.slug || p.categoryId}`,
                },
                { name: p.model },
              ]}
            />
            <ProductViewTracker product={ps} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: safeJson(schema) }}
            />
            <div className="product-detail-main">
              <ProductGallery
                images={p.images}
                name={p.name}
                sample={p.isSample}
              />
              <div className="product-summary">
                <div className="product-summary-top">
                  <Link href="/brands" className="product-brand" dir="ltr">
                    {tr(p.brand)}
                  </Link>
                  {p.isNew && (
                    <span className="inline-badge">
                      {tr("جدید در کاتالوگ")}
                    </span>
                  )}
                </div>
                <h1>{tr(p.name)}</h1>
                <div className="product-code-row">
                  <span>
                    {tr("مدل: ")}
                    <bdi>{tr(p.model)}</bdi>
                  </span>
                  <span>
                    {tr("کد کالا: ")}
                    <bdi>{tr(p.sku)}</bdi>
                  </span>
                </div>
                <a href="#reviews" className="review-jump">
                  <MessageSquare size={14} />
                  {tr("هنوز دیدگاهی ثبت نشده")}
                </a>
                <p className="product-summary-description">
                  {tr(p.shortDescription)}
                </p>
                <div className="technical-highlights">
                  {p.specifications
                    .filter((s) => s.highlight)
                    .slice(0, 3)
                    .map((s) => (
                      <div key={s.key}>
                        <span>{tr(s.label)}</span>
                        <strong
                          dir={
                            locale === "en" || isTechnical(s.value)
                              ? "ltr"
                              : "rtl"
                          }
                        >
                          {tr(s.value)}
                        </strong>
                      </div>
                    ))}
                </div>
                <div className="product-price-box">
                  <span>
                    {p.price !== null ? (
                      <>
                        <strong>{fmtNumber(p.price)}</strong>
                        {tr(" تومان")}
                      </>
                    ) : (
                      <>
                        <strong>{tr("قیمت با استعلام")}</strong>
                        <small>{tr("متناسب با مدل و تعداد سفارش شما")}</small>
                      </>
                    )}
                  </span>
                  <span className={`availability ${p.availability}`}>
                    <i />
                    {tr(
                      p.availability === "in_stock"
                        ? tr("موجود")
                        : p.availability === "unavailable"
                          ? tr("فعلاً ناموجود")
                          : tr("موجودی نیازمند تأیید"),
                    )}
                  </span>
                </div>
                <ProductActions product={ps} />
                <div className="product-assurances">
                  <span>
                    <ScanLine size={17} />
                    {tr("بررسی مشخصات پیش از انتخاب")}
                  </span>
                  <span>
                    <Package size={17} />
                    {tr("استعلام شرایط تأمین")}
                  </span>
                </div>
                {p.isSample && <SampleNotice compact />}
              </div>
            </div>
            <ProductTabs />
            <section id="overview" className="product-section overview-section">
              <div>
                <div className="eyebrow">
                  <span />
                  {tr("نگاهی نزدیک‌تر")}
                </div>
                <h2>{tr("جزئیاتی که در کار تفاوت می‌سازند.")}</h2>
                <p>{tr(p.longDescription)}</p>
              </div>
              <div className="feature-list">
                <h3>{tr("ویژگی‌های کلیدی")}</h3>
                {p.features.length ? (
                  p.features.map((f) => (
                    <div key={f}>
                      <span>
                        <Check size={15} />
                      </span>
                      <p>{tr(f)}</p>
                    </div>
                  ))
                ) : (
                  <p>
                    {tr(
                      "برای بررسی ویژگی‌های تکمیلی، مشخصات این محصول را مطالعه کنید.",
                    )}
                  </p>
                )}
              </div>
            </section>
            <section id="specifications" className="product-section">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">
                    <span />
                    {tr("اطلاعات قابل بررسی")}
                  </div>
                  <h2>{tr("مشخصات فنی")}</h2>
                </div>
                <DocumentDownload
                  name={p.model}
                  href={`/api/products/${p.id}/datasheet`}
                  label={
                    <>
                      <Download size={17} />
                      {tr("دریافت برگه مشخصات")}
                      <span className="small">HTML</span>
                    </>
                  }
                />
              </div>
              <div className="technical-table-wrap">
                <table className="technical-table">
                  <caption className="sr-only">
                    {tr("مشخصات فنی ")}
                    {tr(p.name)}
                  </caption>
                  <tbody>
                    {[
                      { key: "brand", label: tr("برند"), value: p.brand },
                      { key: "model", label: tr("مدل"), value: p.model },
                      { key: "sku", label: tr("کد کالا"), value: p.sku },
                      ...p.specifications,
                    ].map((s) => (
                      <tr key={s.key}>
                        <th scope="row">{tr(s.label)}</th>
                        <td>
                          <bdi
                            dir={
                              locale === "en" || isTechnical(s.value)
                                ? "ltr"
                                : "rtl"
                            }
                          >
                            {tr(s.value)}
                          </bdi>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {p.isSample && (
                <p className="technical-note">
                  <Info size={15} />
                  {tr(
                    "مشخصات بالا نمونه‌اند؛ قبل از سفارش با سند رسمی محصول تطبیق داده شوند.",
                  )}
                </p>
              )}
            </section>
            <section
              id="applications"
              className="product-section product-use-grid"
            >
              <div>
                <div className="eyebrow">
                  <span />
                  {tr("تناسب با نیاز شما")}
                </div>
                <h2>{tr("کاربرد و سازگاری")}</h2>
                <p>
                  {tr(
                    "مدل دستگاه، ابعاد نصب، شرایط محیط و نوع کار را پیش از انتخاب بررسی کنید. صرفاً شباهت ظاهری، نشانه سازگاری نیست.",
                  )}
                </p>
                <div className="application-product-links">
                  {apps.map((a) => (
                    <Link key={a.id} href={`/applications/${a.slug}`}>
                      {tr(a.name)}
                      <ArrowUpLeft size={16} />
                    </Link>
                  ))}
                </div>
                {compatible.length > 0 && (
                  <div className="compatible-links">
                    <h3>{tr("محصولات مرتبط با سازگاری")}</h3>
                    {compatible.slice(0, 6).map((cp) => (
                      <Link key={cp.id} href={`/product/${cp.slug}`}>
                        <bdi>{tr(cp.model)}</bdi>
                        <ArrowLeft size={14} />
                      </Link>
                    ))}
                    <p className="small muted">
                      {tr("سازگاری‌های ثبت‌شده در این نسخه نمونه‌اند.")}
                    </p>
                  </div>
                )}
              </div>
              <div className="included-box">
                <Package size={25} />
                <h3>{tr("اقلام همراه")}</h3>
                <ul>
                  {p.included.map((v) => (
                    <li key={v}>{tr(v)}</li>
                  ))}
                </ul>
                <p>
                  {tr("اقلام و بسته‌بندی نهایی را هنگام استعلام تأیید کنید.")}
                </p>
              </div>
            </section>
            <section id="documents" className="product-section">
              <SectionHeading
                eyebrow={tr("پیش از سفارش بررسی کنید")}
                title={tr("اسناد، نگهداری و ضمانت")}
              />
              <div className="documents-grid">
                <div className="document-card">
                  <FileText size={26} />
                  <h3>{tr("برگه مشخصات محصول")}</h3>
                  <p>
                    {tr(
                      "اطلاعات همین صفحه در یک فایل مستقل و قابل چاپ؛ با نمایش روشن وضعیت نمونه.",
                    )}
                  </p>
                  <DocumentDownload
                    name={p.model}
                    href={`/api/products/${p.id}/datasheet`}
                    label={
                      <>
                        {tr("دریافت فایل HTML")}
                        <Download size={16} />
                      </>
                    }
                  />
                </div>
                <div className="document-card">
                  <Boxes size={26} />
                  <h3>{tr("دفترچه و اسناد رسمی")}</h3>
                  {[...p.documents, ...p.manuals].length ? (
                    [...p.documents, ...p.manuals].map((d) => (
                      <a
                        key={d.url}
                        href={d.url}
                        download
                        className="document-download"
                      >
                        {tr(d.name)}
                        <Download size={16} />
                      </a>
                    ))
                  ) : (
                    <>
                      <p>
                        {tr(
                          "هنوز سند رسمی برای این مدل بارگذاری نشده است. فایل ناموجود یا تأییدنشده ارائه نمی‌شود.",
                        )}
                      </p>
                      <span className="document-status">
                        {tr("در انتظار تکمیل اطلاعات")}
                      </span>
                    </>
                  )}
                </div>
                <div className="document-card">
                  <ShieldCheck size={26} />
                  <h3>{tr("شرایط ضمانت")}</h3>
                  <p>{tr(p.warranty)}</p>
                  <Link
                    className="text-link"
                    href={`/quote?product=${p.id}&purpose=consultation`}
                  >
                    {tr("پرسش درباره خدمات")}
                    <ArrowLeft size={16} />
                  </Link>
                </div>
              </div>
            </section>
            {p.videos.length > 0 && (
              <section className="product-section">
                <h2>{tr("ویدئوی محصول")}</h2>
                {p.videos.map((v) => (
                  <video
                    key={v}
                    src={v}
                    controls
                    preload="metadata"
                    aria-label={tr("ویدئوی {v0}", { v0: tr(p.name) })}
                    className="product-video"
                  />
                ))}
              </section>
            )}
            <section id="faq" className="product-section product-faq">
              <div>
                <div className="eyebrow">
                  <span />
                  {tr("پاسخ به پرسش‌های شما")}
                </div>
                <h2>{tr("پیش از انتخاب بدانید.")}</h2>
                <p>{tr("پاسخ خود را پیدا نکردید؟")}</p>
                <Link
                  className="text-link"
                  href={`/quote?product=${p.id}&purpose=consultation`}
                >
                  {tr("پرسش از کارشناسان")}
                  <ArrowLeft size={17} />
                </Link>
              </div>
              <div className="faq-list">
                {p.faq.map((f, i) => (
                  <details key={f.question} open={i === 0}>
                    <summary>
                      {tr(f.question)}
                      <ChevronDown size={18} />
                    </summary>
                    <p>{tr(f.answer)}</p>
                  </details>
                ))}
              </div>
            </section>
            {p.faq.length > 0 && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: safeJson({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: p.faq.map((f) => ({
                      "@type": "Question",
                      name: f.question,
                      acceptedAnswer: { "@type": "Answer", text: f.answer },
                    })),
                  }),
                }}
              />
            )}
            <section id="reviews" className="reviews-section">
              <MessageSquare size={26} />
              <div>
                <h2>{tr("دیدگاه کاربران")}</h2>
                <p>
                  {tr(
                    "هنوز دیدگاهی برای این محصول ثبت نشده است. امتیاز یا تجربه تأییدنشده نمایش داده نمی‌شود.",
                  )}
                </p>
              </div>
              <Link
                href={`/quote?product=${p.id}&purpose=consultation`}
                className="button secondary small"
              >
                {tr("پرسش درباره محصول")}
                <ArrowLeft size={16} />
              </Link>
            </section>
          </div>
          {related.length > 0 && (
            <section className="section related-section">
              <div className="container">
                <SectionHeading
                  eyebrow={tr("گزینه‌های دیگر را هم ببینید")}
                  title={tr("مدل‌های مشابه، برای مقایسه دقیق‌تر")}
                  href={`/products/${category?.slug || p.categoryId}`}
                  linkLabel={tr("همه مدل‌های این دسته")}
                />
                <ProductGrid products={related} />
              </div>
            </section>
          )}
          {accessories.length > 0 && (
            <section className="section accessories-section">
              <div className="container">
                <SectionHeading
                  eyebrow={tr("مجموعه‌تان را کامل کنید")}
                  title={tr("متعلقات پیشنهادی")}
                  description={tr(
                    "پیشنهادها بر اساس ارتباط ثبت‌شده در کاتالوگ نمونه‌اند، نه آمار خرید همزمان.",
                  )}
                />
                <ProductGrid products={accessories} />
              </div>
            </section>
          )}
          <RecentProducts excludeId={p.id} />
        </>
      }
    </RuntimeTranslations>
  );
}
