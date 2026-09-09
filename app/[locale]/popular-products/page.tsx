import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { CatalogPage } from "@/components/catalog-page";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("محصولات پرطرفدار نمونه"),
    tr("چیدمان نمایشی محصولات پرطرفدار؛ بدون ادعای آمار فروش واقعی."),
    "/popular-products",
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
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <CatalogPage
          title={tr("محصولات پرطرفدار")}
          description={tr(
            "این مجموعه، چیدمان نمونه بخش پرطرفدارهاست و بر اساس آمار بازدید یا فروش واقعی نیست.",
          )}
          collection="popular"
          params={await searchParams}
          breadcrumb={[
            { name: tr("محصولات"), href: "/products" },
            { name: tr("پرطرفدارها") },
          ]}
        />
      }
    </RuntimeTranslations>
  );
}
