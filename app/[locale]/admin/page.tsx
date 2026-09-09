import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { isAdmin } from "@/lib/security";
import {
  getCategories,
  getBrands,
  getApplications,
  getArticles,
  getSettings,
  queryProducts,
} from "@/lib/catalog";
import { getDB } from "@/lib/db";
import type { Quote } from "@/lib/types";
import { localizedMetadata as meta } from "@/i18n/metadata";
import { AdminLogin } from "@/components/admin/login";
import { AdminDashboard } from "@/components/admin/dashboard";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("مدیریت محتوا"),
    tr("پنل مدیریت محافظت‌شده کانوکس."),
    "/admin",
    true,
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
  if (!(await isAdmin())) return <AdminLogin />;
  const p = await searchParams,
    tab = [
      "products",
      "categories",
      "brands",
      "articles",
      "quotes",
      "settings",
      "translations",
    ].includes(String(p.tab))
      ? String(p.tab)
      : "products",
    query = String(p.q || "").slice(0, 200),
    page = Math.max(1, Math.min(10000, parseInt(String(p.page)) || 1));
  const products = queryProducts({ query, page, pageSize: 20 });
  const db = getDB(),
    totalQuotes = (
      db.prepare("SELECT COUNT(*) n FROM quotes").get() as {
        n: number;
      }
    ).n,
    quotePages = Math.max(1, Math.ceil(totalQuotes / 20)),
    quotePage = Math.min(quotePages, page);
  const quotes = (
    db
      .prepare(
        "SELECT data,status FROM quotes ORDER BY created_at DESC LIMIT 20 OFFSET ?",
      )
      .all((quotePage - 1) * 20) as {
      data: string;
      status: string;
    }[]
  ).map((r) => ({ ...JSON.parse(r.data), status: r.status })) as Quote[];
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <AdminDashboard
          tab={tab}
          products={products.products}
          totalProducts={products.total}
          productPage={products.page}
          productPages={products.pages}
          categories={getCategories()}
          brands={getBrands()}
          applications={getApplications()}
          articles={getArticles()}
          quotes={quotes}
          totalQuotes={totalQuotes}
          quotePage={quotePage}
          quotePages={quotePages}
          settings={getSettings()}
          query={query}
        />
      }
    </RuntimeTranslations>
  );
}
