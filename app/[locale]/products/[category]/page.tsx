import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { notFound } from "next/navigation";

import { getCategories } from "@/lib/catalog";
import { CatalogPage } from "@/components/catalog-page";
import { localizedMetadata as metadata } from "@/i18n/metadata";
type Props = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  const { category: slug } = await params,
    c = getCategories().find((c) => c.slug === slug);
  return metadata(
    c?.name || tr("دسته پیدا نشد"),
    c?.description || "",
    `/products/${slug}`,
  );
}
export default async function CategoryPage({ params, searchParams }: Props) {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = await getI18n();
  const { category: slug } = await params,
    c = getCategories().find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <CatalogPage
          title={tr(c.name)}
          description={tr(
            tr(c.description).replace(/[.。]+$/g, "") +
              tr(
                "؛ مشخصات فنی مدل‌ها را کنار هم ببینید و متناسب با نیاز پروژه انتخاب کنید.",
              ),
          )}
          category={c}
          params={await searchParams}
        />
      }
    </RuntimeTranslations>
  );
}
