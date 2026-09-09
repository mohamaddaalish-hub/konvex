import { HeroMedia } from "@/components/hero-media";
import { RuntimeTranslations } from "@/components/runtime-translations";
import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowUpLeft,
  ScanLine,
  Layers3,
  GitCompareArrows,
  MessagesSquare,
  ShieldCheck,
  SlidersHorizontal,
  Clock3,
} from "lucide-react";
import {
  getCategories,
  getApplications,
  getArticles,
  queryProducts,
} from "@/lib/catalog";
import { faNumber } from "@/lib/format";
import { ProductImage, SectionHeading, ConsultationCTA } from "@/components/ui";
import {
  HomeProducts,
  ApplicationsFeature,
  CatalogDownload,
} from "@/components/home-interactions";
import { RecentProducts } from "@/components/saved-products";
export default function HomePage() {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = useI18n();
  const categories = getCategories(),
    mainCategories = categories.filter(
      (c) => c.id !== "accessories" && !c.parentId,
    ),
    applications = getApplications(),
    articles = getArticles().slice(0, 3);
  const featured = queryProducts({
      collection: "featured",
      pageSize: 4,
    }).products,
    newProducts = queryProducts({
      collection: "new",
      sort: "newest",
      pageSize: 4,
    }).products,
    popular = queryProducts({
      collection: "popular",
      sort: "popular",
      pageSize: 4,
    }).products;
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span />
                {tr("ابزار و تجهیزات صنعتی کانوکس")}
              </div>
              <h1>
                {tr("دقت در انتخاب.")}
                <br />
                <span>{tr("قدرت در اجرا.")}</span>
              </h1>
              <p className="hero-description">
                {tr("برای آن‌هایی که کیفیت کارشان اتفاقی نیست.")}
                <br />
                {tr("ابزار مناسب را بشناسید، مشخصات را مقایسه کنید")}
                <br className="desktop-only" />
                {tr(" و با اطمینان انتخاب کنید.")}
              </p>
              <div className="hero-actions">
                <Link className="button primary" href="/products">
                  {tr("مشاهده محصولات")}
                  <ArrowLeft size={20} />
                </Link>
                <CatalogDownload />
              </div>
              <div className="hero-footnote">
                <span className="hero-small-mark">K</span>
                <span>
                  {tr("یک مجموعه تخصصی.")}
                  <br />
                  <strong>{tr("از اندازه‌گیری تا اجرای دقیق.")}</strong>
                </span>
                <span className="hero-index" dir="ltr">
                  EST. FOR
                  <br />
                  THE WORK.
                </span>
              </div>
            </div>
            <div className="hero-art">
              <HeroMedia
                alt={tr(
                  "تصویر اختصاصی نمونه مجموعه ابزار صنعتی کانوکس شامل قلم، چرخ، تراز، متر لیزری و صفحه سایش روی سطوح بتنی",
                )}
              />
              <span className="hero-art-top" dir="ltr">
                <i />
                THE KONVEX COLLECTION
              </span>
              <Link className="hero-image-link" href="/products">
                <span>
                  <small>{tr("دقت در جزئیات")}</small>
                  <strong>{tr("تفاوت در نتیجه.")}</strong>
                </span>
                <span className="round-arrow">
                  <ArrowUpLeft size={23} />
                </span>
              </Link>
              <div className="hero-ruler" aria-hidden="true" />
            </div>
          </section>
          <div className="value-strip">
            <div className="container">
              <div>
                <Layers3 size={25} />
                <span>
                  <strong>
                    {fmtNumber(mainCategories.length)}
                    {tr(" حوزه تخصصی")}
                  </strong>
                  <small>{tr("یک مسیر روشن برای انتخاب")}</small>
                </span>
              </div>
              <div>
                <ScanLine size={26} />
                <span>
                  <strong>{tr("مشخصات فنی، بدون ابهام")}</strong>
                  <small>{tr("جزئیاتی که برای کار شما مهم‌اند")}</small>
                </span>
              </div>
              <div>
                <GitCompareArrows size={26} />
                <span>
                  <strong>{tr("مقایسه قبل از انتخاب")}</strong>
                  <small>{tr("تصمیم بر اساس نیاز واقعی")}</small>
                </span>
              </div>
              <Link href="/quote?purpose=consultation">
                <MessagesSquare size={26} />
                <span>
                  <strong>{tr("انتخاب با راهنمایی")}</strong>
                  <small>{tr("نیاز پروژه‌تان را مطرح کنید")}</small>
                </span>
                <ArrowUpLeft size={16} />
              </Link>
            </div>
          </div>
          <section className="section categories-section">
            <div className="container">
              <SectionHeading
                eyebrow={tr("دسته‌بندی محصولات")}
                title={tr("برای هر کار، ابزار مناسب.")}
                description={tr(
                  "از اینجا شروع کنید؛ یک قدم نزدیک‌تر به انتخاب درست.",
                )}
                href="/products"
                linkLabel={tr("مشاهده همه محصولات")}
              />
              <div className="category-grid">
                {mainCategories.map((c, i) => (
                  <Link
                    href={`/products/${c.slug}`}
                    className="category-card"
                    key={c.id}
                  >
                    <div className="category-topline">
                      <span dir="ltr">{tr(c.english)}</span>
                      <span dir="ltr">0{i + 1}</span>
                    </div>
                    <div className="category-image">
                      <ProductImage
                        src={c.image}
                        alt={tr("خانواده محصولات {v0}", { v0: tr(c.name) })}
                        sizes="(max-width: 640px) 44vw, 240px"
                      />
                    </div>
                    <div className="category-card-body">
                      <h3>{tr(c.name)}</h3>
                      <p>{tr(c.description)}</p>
                      <div className="category-card-footer">
                        <span>
                          {fmtNumber(c.count || 0)}
                          {tr(" محصول")}
                        </span>
                        <span className="category-arrow">
                          <ArrowLeft size={18} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
          <HomeProducts
            featured={featured}
            newProducts={newProducts}
            popular={popular}
          />
          <ApplicationsFeature
            applications={applications}
            categories={categories}
          />
          <section className="section promise-section">
            <div className="container promise-grid">
              <div className="promise-heading">
                <span className="eyebrow">
                  <span />
                  {tr("روش کانوکس")}
                </span>
                <h2>
                  {tr("انتخاب حرفه‌ای،")}
                  <br />
                  {tr("از اطلاعات دقیق شروع می‌شود.")}
                </h2>
                <p>
                  {tr("ما جزئیات را کنار هم می‌گذاریم")}
                  <br />
                  {tr("تا شما روی نتیجه کار تمرکز کنید.")}
                </p>
                <Link className="text-link" href="/about">
                  {tr("بیشتر درباره کانوکس")}
                  <ArrowLeft size={18} />
                </Link>
              </div>
              <div className="promise-items">
                {[
                  {
                    icon: ScanLine,
                    title: tr("شفافیت در مشخصات"),
                    text: tr(
                      "ابعاد، جنس و عملکرد؛ اطلاعاتی مرتب و قابل بررسی، نه توضیحات مبهم.",
                    ),
                  },
                  {
                    icon: SlidersHorizontal,
                    title: tr("انتخاب متناسب با نیاز"),
                    text: tr(
                      "فیلترهای تخصصی برای پیدا کردن ابزار سازگار با شرایط پروژه شما.",
                    ),
                  },
                  {
                    icon: GitCompareArrows,
                    title: tr("مقایسه‌ای کاربردی"),
                    text: tr(
                      "تفاوت مدل‌ها را کنار هم ببینید و با شناخت بیشتری تصمیم بگیرید.",
                    ),
                  },
                  {
                    icon: MessagesSquare,
                    title: tr("استعلام پیش از سفارش"),
                    text: tr(
                      "قیمت، موجودی و شرایط تأمین را پیش از نهایی کردن انتخاب بررسی کنید.",
                    ),
                  },
                ].map(({ icon: Icon, title, text }, i) => (
                  <div className="promise-item" key={title}>
                    <span className="promise-icon">
                      <Icon size={25} />
                    </span>
                    <span className="promise-number" dir="ltr">
                      0{i + 1}
                    </span>
                    <h3>{tr(title)}</h3>
                    <p>{tr(text)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="section knowledge-section">
            <div className="container">
              <SectionHeading
                eyebrow={tr("دانشنامه ابزار")}
                title={tr("بهتر بشناسید. دقیق‌تر انتخاب کنید.")}
                href="/knowledge"
                linkLabel={tr("همه راهنماها")}
              />
              <div className="article-grid">
                {articles.map((a, i) => (
                  <article className="article-card" key={a.id}>
                    <Link
                      className="article-image"
                      href={`/knowledge/${a.slug}`}
                      tabIndex={-1}
                    >
                      <ProductImage
                        src={a.image}
                        alt={tr(a.title)}
                        sizes="(max-width: 640px) 100vw, 420px"
                        width={800}
                        height={500}
                      />
                      <span className="article-image-index" dir="ltr">
                        GUIDE / 0{i + 1}
                      </span>
                    </Link>
                    <div className="article-meta">
                      <span>{tr(a.category)}</span>
                      <span>
                        <Clock3 size={13} />
                        {fmtNumber(a.readTime)}
                        {tr(" دقیقه مطالعه")}
                      </span>
                    </div>
                    <h3>
                      <Link href={`/knowledge/${a.slug}`}>{tr(a.title)}</Link>
                    </h3>
                    <p>{tr(a.excerpt)}</p>
                    <Link className="text-link" href={`/knowledge/${a.slug}`}>
                      {tr("مطالعه راهنما")}
                      <ArrowLeft size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <RecentProducts />
          <ConsultationCTA />
        </>
      }
    </RuntimeTranslations>
  );
}
