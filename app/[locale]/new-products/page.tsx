import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { CatalogPage } from "@/components/catalog-page";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("محصولات جدید"),
    tr("تازه‌واردهای کاتالوگ نمونه کانوکس؛ مشخصات، مقایسه و درخواست قیمت."),
    "/new-products",
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
          title={tr("تازه‌واردهای کانوکس")}
          description={tr(
            "مدل‌های جدید کاتالوگ را بشناسید و مشخصات آن‌ها را با نیاز پروژه تطبیق دهید.",
          )}
          collection="new"
          params={await searchParams}
          breadcrumb={[
            { name: tr("محصولات"), href: "/products" },
            { name: tr("محصولات جدید") },
          ]}
        />
      }
    </RuntimeTranslations>
  );
}
