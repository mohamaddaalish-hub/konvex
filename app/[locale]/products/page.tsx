import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { CatalogPage } from "@/components/catalog-page";
import { metadata as makeMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return makeMetadata(
    tr("محصولات صنعتی"),
    tr(
      "محصولات کانوکس را بر اساس دسته، کاربرد و مشخصات فنی پیدا و مقایسه کنید.",
    ),
    "/products",
  );
}
export default async function Products({
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
          title={tr("ابزار درست، برای کارِ درست.")}
          description={tr(
            "خانواده محصولات کانوکس را بشناسید. مشخصات را بررسی کنید و انتخاب را با نیاز کارتان هماهنگ کنید.",
          )}
          params={await searchParams}
        />
      }
    </RuntimeTranslations>
  );
}
