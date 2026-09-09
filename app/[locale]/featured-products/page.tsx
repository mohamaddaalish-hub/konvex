import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { CatalogPage } from "@/components/catalog-page";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("محصولات منتخب"),
    tr("انتخاب‌های کاتالوگ کانوکس برای آشنایی با خانواده محصولات."),
    "/featured-products",
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
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <CatalogPage
          title={tr("منتخب کانوکس")}
          description={tr(
            "نقطه شروعی برای آشنایی با محصولات در پنج حوزه تخصصی؛ از اندازه‌گیری تا اجرای دقیق.",
          )}
          collection="featured"
          params={await searchParams}
          breadcrumb={[
            { name: tr("محصولات"), href: "/products" },
            { name: tr("محصولات منتخب") },
          ]}
        />
      }
    </RuntimeTranslations>
  );
}
