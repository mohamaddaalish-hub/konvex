import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { useI18n } from "@/i18n/use-i18n";
import { getCategories } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui";
import { Comparison } from "@/components/comparison";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("مقایسه محصولات"),
    tr("تا سه محصول هم‌دسته را بر اساس مشخصات فنی مقایسه کنید."),
    "/compare",
    true,
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
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <div className="container page-container">
          <Breadcrumb
            items={[
              { name: tr("محصولات"), href: "/products" },
              { name: tr("مقایسه") },
            ]}
          />
          <div className="page-title">
            <div className="eyebrow">
              <span />
              {tr("انتخاب بر اساس تفاوت‌های واقعی")}
            </div>
            <h1>{tr("کنار هم ببینید. دقیق‌تر انتخاب کنید.")}</h1>
            <p>
              {tr(
                "حداکثر سه محصول از یک دسته؛ با نمایش مشخصاتی که در کار شما اهمیت دارند.",
              )}
            </p>
          </div>
          <Comparison categories={getCategories()} />
        </div>
      }
    </RuntimeTranslations>
  );
}
