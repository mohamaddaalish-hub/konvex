import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import Link from "@/i18n/navigation";
import { ArrowLeft, Clock3, Search } from "lucide-react";
import { getArticles } from "@/lib/catalog";
import { normalizeSearch, faNumber } from "@/lib/format";
import {
  Breadcrumb,
  ProductImage,
  EmptyState,
  ConsultationCTA,
} from "@/components/ui";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("دانشنامه ابزار"),
    tr(
      "راهنماهای انتخاب ابزار، مشخصات فنی، سازگاری و نکات کاربردی برای کار حرفه‌ای.",
    ),
    "/knowledge",
  );
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = await getI18n();
  const p = await searchParams,
    q = String(p.q || "").slice(0, 200),
    cat = String(p.category || "");
  const all = getArticles(),
    articles = all.filter(
      (a) =>
        (!q ||
          normalizeSearch(a.title + " " + a.excerpt).includes(
            normalizeSearch(q),
          )) &&
        (!cat || a.category === cat),
    );
  const cats = [...new Set(all.map((a) => a.category))];
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <>
          <div className="container page-container knowledge-page">
            <Breadcrumb items={[{ name: tr("دانشنامه ابزار") }]} />
            <div className="page-title">
              <div className="eyebrow">
                <span />
                {tr("دانش انتخاب")}
              </div>
              <h1>
                {tr("بهتر بشناسید.")}
                <br />
                {tr("دقیق‌تر انتخاب کنید.")}
              </h1>
              <p>
                {tr(
                  "راهنماهای کاربردی برای زمانی که جزئیات فنی، نتیجه کار را تغییر می‌دهند.",
                )}
              </p>
            </div>
            <div className="knowledge-toolbar">
              <nav aria-label={tr("دسته مقاله")}>
                <Link className={!cat ? "active" : ""} href="/knowledge">
                  {tr("همه راهنماها")}
                </Link>
                {cats.map((c) => (
                  <Link
                    className={cat === c ? "active" : ""}
                    key={c}
                    href={`/knowledge?category=${encodeURIComponent(c)}`}
                  >
                    {tr(c)}
                  </Link>
                ))}
              </nav>
              <form
                action={localizedPath("/knowledge")}
                method="get"
                className="catalog-search"
              >
                <Search size={18} />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder={tr("جستجو در راهنماها…")}
                  aria-label={tr("جستجو در دانشنامه")}
                  maxLength={200}
                />
                {cat && <input type="hidden" name="category" value={cat} />}
                <button className="icon-button" aria-label={tr("جستجوی مقاله")}>
                  <ArrowLeft size={18} />
                </button>
              </form>
            </div>
            {articles.length ? (
              <div className="article-grid">
                {articles.map((a) => (
                  <article className="article-card" key={a.id}>
                    <Link
                      className="article-image"
                      href={`/knowledge/${a.slug}`}
                      aria-label={tr(a.title)}
                      tabIndex={-1}
                    >
                      <ProductImage
                        src={a.image}
                        alt={tr(a.title)}
                        sizes="(max-width: 640px) 100vw, 420px"
                        width={800}
                        height={500}
                      />
                    </Link>
                    <div className="article-meta">
                      <span>{tr(a.category)}</span>
                      <span>
                        <Clock3 size={13} />
                        {fmtNumber(a.readTime)}
                        {tr(" دقیقه مطالعه")}
                      </span>
                    </div>
                    <h2>
                      <Link href={`/knowledge/${a.slug}`}>{tr(a.title)}</Link>
                    </h2>
                    <p>{tr(a.excerpt)}</p>
                    <Link className="text-link" href={`/knowledge/${a.slug}`}>
                      {tr("مطالعه راهنما")}
                      <ArrowLeft size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                search
                title={tr("راهنمایی با این عبارت پیدا نشد.")}
                description={tr(
                  "یک عبارت کوتاه‌تر را امتحان کنید یا همه راهنماها را ببینید.",
                )}
                actionHref="/knowledge"
                actionLabel={tr("همه راهنماها")}
              />
            )}
          </div>
          <ConsultationCTA />
        </>
      }
    </RuntimeTranslations>
  );
}
