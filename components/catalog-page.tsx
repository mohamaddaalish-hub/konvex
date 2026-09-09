import { useI18n } from "@/i18n/use-i18n";
import { getCategories, queryProducts, parseQuery } from "@/lib/catalog";
import type { Category, QueryOptions } from "@/lib/types";
import { CatalogExplorer } from "./catalog-explorer";
import { Breadcrumb } from "./ui";
import { faNumber } from "@/lib/format";
export function CatalogPage({
  title,
  description,
  category,
  params = {},
  collection,
  application,
  breadcrumb,
}: {
  title: string;
  description: string;
  category?: Category;
  params?: Record<string, string | string[] | undefined>;
  collection?: QueryOptions["collection"];
  application?: string;
  breadcrumb?: {
    name: string;
    href?: string;
  }[];
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const options = {
    ...parseQuery(params),
    locale,
    category: category?.id,
    collection,
    application,
  };
  const result = queryProducts(options);
  const categories = getCategories();
  const suggestions = result.total
    ? []
    : queryProducts({ category: category?.id, pageSize: 3 }).products;
  return (
    <div className="container page-container catalog-page">
      <Breadcrumb
        items={
          breadcrumb || [
            { name: tr("محصولات"), href: category ? "/products" : undefined },
            ...(category ? [{ name: category.name }] : []),
          ]
        }
      />
      <div className="page-title-row catalog-title">
        <div className="page-title">
          <div className="eyebrow">
            <span />
            {tr(category?.english || tr("کاتالوگ تخصصی ابزار و تجهیزات صنعتی"))}
          </div>
          <h1>{tr(title)}</h1>
          <p>{tr(description)}</p>
        </div>
        <span className="catalog-heading-count">
          <b>{fmtNumber(result.total)}</b>
          <span>{tr("محصول در این مجموعه")}</span>
        </span>
      </div>
      <CatalogExplorer
        result={result}
        categories={categories}
        category={category}
        options={options}
        suggestions={suggestions}
      />
    </div>
  );
}
