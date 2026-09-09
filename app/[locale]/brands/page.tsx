import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { getBrands, queryProducts } from "@/lib/catalog";
import {
  Breadcrumb,
  Brandmark,
  ProductImage,
  EmptyState,
} from "@/components/ui";
import { faNumber } from "@/lib/format";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("برندها"),
    tr("معرفی برندهای موجود در کاتالوگ صنعتی کانوکس."),
    "/brands",
  );
}
export default function Page() {
  const {
    dictionary,
    t: tr,
    locale,
    n: fmtNumber,
    path: localizedPath,
  } = useI18n();
  const brands = getBrands();
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <div className="container page-container">
          <Breadcrumb items={[{ name: tr("برندها") }]} />
          <div className="page-title">
            <span className="eyebrow">
              <span />
              {tr("هویت پشت محصول")}
            </span>
            <h1>{tr("برندها را بهتر بشناسید.")}</h1>
            <p>
              {tr(
                "برندهای ثبت‌شده در کاتالوگ؛ همراه با معرفی و دسترسی مستقیم به محصولات.",
              )}
            </p>
          </div>
          <div className="brands-directory">
            {brands.length ? (
              brands.map((b) => (
                <article className="brand-profile" key={b.id}>
                  <div>
                    {b.logo ? (
                      <ProductImage
                        src={b.logo}
                        alt={tr(b.name)}
                        className="brand-logo-image"
                      />
                    ) : (
                      <Brandmark name={b.english} persian={b.name} />
                    )}
                    <span className="brand-product-count">
                      {fmtNumber(
                        queryProducts({
                          filters: { brand: [b.id] },
                          pageSize: 1,
                        }).total,
                      )}{" "}
                      {tr("محصول در کاتالوگ")}
                    </span>
                  </div>
                  <div>
                    <h2>
                      {tr(b.name)} <bdi>{tr(b.english)}</bdi>
                    </h2>
                    <p>{tr(b.description)}</p>
                    <Link
                      href={`/products?f.brand=${b.id}`}
                      className="button primary"
                    >
                      {tr("مشاهده محصولات این برند")}
                      <ArrowLeft size={18} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title={tr("هنوز برندی ثبت نشده است.")} />
            )}
          </div>
          <p className="brand-directory-note">
            {tr(
              "فقط برندهای واقعاً ثبت‌شده نمایش داده می‌شوند؛ هیچ همکاری یا نمایندگی تأییدنشده‌ای ادعا نمی‌شود.",
            )}
          </p>
        </div>
      }
    </RuntimeTranslations>
  );
}
