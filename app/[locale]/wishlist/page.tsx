import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { useI18n } from "@/i18n/use-i18n";
import { Breadcrumb } from "@/components/ui";
import { WishlistPageContent } from "@/components/saved-products";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("محصولات ذخیره‌شده"),
    tr("فهرست محصولات ذخیره‌شده شما در کانوکس."),
    "/wishlist",
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
          <Breadcrumb items={[{ name: tr("محصولات ذخیره‌شده") }]} />
          <WishlistPageContent />
        </div>
      }
    </RuntimeTranslations>
  );
}
