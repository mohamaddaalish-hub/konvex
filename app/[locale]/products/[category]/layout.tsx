import { getI18n } from "@/i18n/server";
import { getCategories } from "@/lib/catalog";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    category: string;
  }>;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  const { category } = await params;
  if (!getCategories().some((c) => c.slug === category)) notFound();
  return children;
}
