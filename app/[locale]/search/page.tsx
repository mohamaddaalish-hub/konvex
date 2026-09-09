import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { CatalogPage } from "@/components/catalog-page";
import { localizedMetadata as metadata } from "@/i18n/metadata";
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ searchParams }: Props) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  const p = await searchParams;
  return metadata(
    p.q
      ? tr("جستجوی {v0}", { v0: tr(String(p.q).slice(0, 100)) })
      : tr("جستجوی محصولات"),
    tr("جستجو بر اساس نام، مدل، کد کالا و مشخصات فنی."),
    "/search",
    true,
  );
}
export default async function SearchPage({ searchParams }: Props) {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = await getI18n();
  const p = await searchParams;
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <CatalogPage
          title={tr(
            p.q
              ? tr("نتایج جستجوی «{v0}»", { v0: tr(String(p.q).slice(0, 100)) })
              : tr("محصول موردنظرتان را پیدا کنید."),
          )}
          description={tr(
            "نام فارسی یا لاتین، کد مدل یا یک مشخصه فنی را جستجو کنید.",
          )}
          params={p}
          breadcrumb={[{ name: tr("جستجو") }]}
        />
      }
    </RuntimeTranslations>
  );
}
