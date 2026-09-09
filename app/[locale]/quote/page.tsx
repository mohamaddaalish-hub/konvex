import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { getProductsByIds, getSettings } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui";
import { QuoteForm } from "@/components/quote-form";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("درخواست قیمت و مشاوره"),
    tr(
      "نیاز پروژه را مطرح کنید؛ استعلام قیمت، موجودی و راهنمایی انتخاب ابزار.",
    ),
    "/quote",
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
  const p = await searchParams,
    ids = String(p.product || p.products || "")
      .split(",")
      .filter(Boolean)
      .slice(0, 10),
    products = getProductsByIds([...new Set(ids)]),
    consultation = p.purpose === "consultation";
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <div className="container page-container quote-page">
          <Breadcrumb items={[{ name: tr("درخواست قیمت و مشاوره") }]} />
          <div className="page-title">
            <div className="eyebrow">
              <span />
              {tr("شروع یک انتخاب مطمئن")}
            </div>
            <h1>
              {tr(
                consultation
                  ? tr("از نیازتان بگویید.")
                  : tr("برای پروژه شما، یک پیشنهاد مشخص."),
              )}
            </h1>
            <p>
              {tr(
                "محصول، تعداد و شرایط کار را بنویسید. ثبت درخواست فقط چند دقیقه زمان می‌برد.",
              )}
            </p>
          </div>
          <QuoteForm
            initialProducts={products}
            consultation={consultation}
            sample={getSettings().sampleMode}
          />
        </div>
      }
    </RuntimeTranslations>
  );
}
