import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { notFound } from "next/navigation";

import { getEntity } from "@/lib/catalog";
import type { Application } from "@/lib/types";
import { CatalogPage } from "@/components/catalog-page";
import { localizedMetadata as metadata } from "@/i18n/metadata";
type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  const { slug } = await params,
    a = getEntity<Application>("application", slug);
  return metadata(
    a ? tr("ابزار مناسب {v0}", { v0: tr(a.name) }) : tr("کاربرد پیدا نشد"),
    a?.description || "",
    `/applications/${slug}`,
  );
}
export default async function Page({ params, searchParams }: Props) {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = await getI18n();
  const { slug } = await params,
    a = getEntity<Application>("application", slug);
  if (!a) notFound();
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <CatalogPage
          title={tr("ابزار مناسب {v0}", { v0: tr(a.name) })}
          description={tr(a.description)}
          application={a.id}
          params={await searchParams}
          breadcrumb={[
            { name: tr("کاربردها"), href: "/applications" },
            { name: a.name },
          ]}
        />
      }
    </RuntimeTranslations>
  );
}
