import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import Link from "@/i18n/navigation";
import { notFound } from "next/navigation";

import { Clock3, ArrowLeft, Info, BookOpen } from "lucide-react";
import { getEntity, getCategories, queryProducts } from "@/lib/catalog";
import type { Article } from "@/lib/types";
import { Breadcrumb, ProductImage, SectionHeading } from "@/components/ui";
import { ProductGrid } from "@/components/product-card";
import { safeJson, siteUrl } from "@/lib/seo";
import { localizedMetadata as metadata } from "@/i18n/metadata";
import { faNumber } from "@/lib/format";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export async function generateMetadata({ params }: Props) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  const { slug } = await params,
    a = getEntity<Article>("article", slug);
  return metadata(
    a?.seoTitle || tr("مقاله پیدا نشد"),
    a?.seoDescription || "",
    `/knowledge/${slug}`,
  );
}
export default async function Page({ params }: Props) {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = await getI18n();
  const { slug } = await params,
    a = getEntity<Article>("article", slug);
  if (!a) notFound();
  const category = getCategories().find((c) => c.id === a.relatedCategory),
    products = queryProducts({
      category: a.relatedCategory,
      pageSize: 4,
    }).products;
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <>
          <article className="container article-page">
            <Breadcrumb
              items={[
                { name: tr("دانشنامه ابزار"), href: "/knowledge" },
                { name: a.title },
              ]}
            />
            <header className="article-header">
              <div className="eyebrow">
                <span />
                {tr(a.category)}
              </div>
              <h1>{tr(a.title)}</h1>
              <p>{tr(a.excerpt)}</p>
              <div className="article-header-meta">
                <span>
                  <BookOpen size={15} />
                  {tr("دانشنامه کانوکس")}
                </span>
                <span>
                  <Clock3 size={15} />
                  {fmtNumber(a.readTime)}
                  {tr(" دقیقه مطالعه")}
                </span>
                <time dateTime={a.publishedAt}>
                  {tr(
                    new Date(a.publishedAt).toLocaleDateString(
                      locale === "en" ? "en-GB" : "fa-IR",
                      {
                        timeZone: "Asia/Tehran",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    ),
                  )}
                </time>
              </div>
            </header>
            <div className="article-hero-image">
              <ProductImage
                src={a.image}
                alt={tr(a.title)}
                eager
                sizes="100vw"
                width={1376}
                height={768}
              />
            </div>
            <div className="article-body-layout">
              <aside className="article-toc">
                <h2>{tr("در این راهنما می‌خوانید")}</h2>
                {a.sections.map((s, i) => (
                  <a href={`#section-${i}`} key={s.title}>
                    <span>{fmtNumber(i + 1)}</span>
                    {tr(s.title)}
                  </a>
                ))}
                <Link
                  href={`/products/${category?.slug || a.relatedCategory}`}
                  className="button secondary small"
                >
                  {tr("مشاهده محصولات مرتبط")}
                  <ArrowLeft size={16} />
                </Link>
              </aside>
              <div className="article-body">
                {a.sections.map((s, i) => (
                  <section id={`section-${i}`} key={s.title}>
                    <span className="article-section-number" dir="ltr">
                      0{i + 1}
                    </span>
                    <h2>{tr(s.title)}</h2>
                    {s.body
                      .split("\n")
                      .filter(Boolean)
                      .map((p, j) => (
                        <p key={j}>{tr(p)}</p>
                      ))}
                  </section>
                ))}
                <div className="article-disclaimer">
                  <Info size={21} />
                  <p>
                    {tr(
                      "این راهنما اطلاعات عمومی انتخاب ابزار است. دستورالعمل رسمی سازنده، استانداردهای مرتبط و ارزیابی ایمنی محیط کار همیشه در اولویت‌اند. مشخصات محصولات کاتالوگ این نسخه، نمونه هستند.",
                    )}
                  </p>
                </div>
                <Link
                  className="button primary"
                  href={`/products/${category?.slug || a.relatedCategory}`}
                >
                  {tr("مقایسه مدل‌های ")}
                  {tr(category?.name)}
                  <ArrowLeft size={18} />
                </Link>
              </div>
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: safeJson({
                  "@context": "https://schema.org",
                  "@type": "Article",
                  headline: tr(a.title),
                  description: tr(a.excerpt),
                  datePublished: a.publishedAt,
                  image: new URL(a.image, siteUrl).toString(),
                  mainEntityOfPage: new URL(
                    "/knowledge/" + a.slug,
                    siteUrl,
                  ).toString(),
                  inLanguage: locale === "en" ? "en-GB" : "fa-IR",
                }),
              }}
            />
          </article>
          <section className="section related-section">
            <div className="container">
              <SectionHeading
                eyebrow={tr("از دانش به انتخاب")}
                title={tr("محصولات مرتبط با این راهنما")}
                href={`/products/${category?.slug || a.relatedCategory}`}
                linkLabel={tr("مشاهده همه مدل‌ها")}
              />
              <ProductGrid products={products} />
            </div>
          </section>
        </>
      }
    </RuntimeTranslations>
  );
}
