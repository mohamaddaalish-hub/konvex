import { getI18n } from "@/i18n/server";
import { getProduct } from "@/lib/catalog";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  const { slug } = await params;
  if (!getProduct(slug)) notFound();
  return children;
}
