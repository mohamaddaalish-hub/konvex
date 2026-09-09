import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { useI18n } from "@/i18n/use-i18n";
import { getAllProducts, getCategories, getSettings } from "@/lib/catalog";
import { Brandmark, ProductImage } from "@/components/ui";
import { faNumber, isTechnical } from "@/lib/format";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("کاتالوگ نمونه قابل چاپ"),
    tr("خانواده محصولات نمونه کانوکس، مشخصات کلیدی و مدل‌ها."),
    "/print/catalog",
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
  const products = getAllProducts(),
    categories = getCategories(),
    s = getSettings();
  const sheets = categories.flatMap((c) => {
    const members = products.filter((p) => p.categoryId === c.id);
    return Array.from({ length: Math.ceil(members.length / 6) }, (_, part) => ({
      category: c,
      part,
      products: members.slice(part * 6, (part + 1) * 6),
    }));
  });
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <div className="print-catalog">
          <section className="print-cover print-sheet">
            <header>
              <Brandmark name={s.englishName} persian={s.name} />
              <span dir="ltr">PRODUCT CATALOGUE / SAMPLE EDITION</span>
            </header>
            <div className="print-cover-title">
              <span>{tr("ابزار و تجهیزات صنعتی")}</span>
              <h1>
                {tr("دقت در انتخاب.")}
                <br />
                {tr("قدرت در اجرا.")}
              </h1>
              <p>{tr("کاتالوگ معرفی خانواده محصولات کانوکس")}</p>
            </div>
            <ProductImage
              src="/images/hero.webp"
              alt={tr("تصویر مفهومی نمونه مجموعه ابزار کانوکس")}
              eager
              width={1264}
              height={848}
              sizes="100vw"
            />
            <div className="print-cover-categories">
              {categories
                .filter((c) => c.id !== "accessories")
                .map((c) => (
                  <span key={c.id}>{tr(c.name)}</span>
                ))}
            </div>
            <div className="print-sample-warning">
              <strong>
                {tr("نسخه نمونه — برای بررسی طراحی و ساختار کاتالوگ")}
              </strong>
              <p>
                {tr(
                  "تمام مدل‌ها، مشخصات و تصاویر این نسخه نمونه‌اند. تصاویر با هوش مصنوعی تولید شده‌اند و عکس مستند کالای واقعی نیستند. اطلاعات این فایل نباید مبنای سفارش، انتخاب فنی یا تصمیم ایمنی باشد؛ تأیید رسمی برند لازم است.",
                )}
              </p>
            </div>
            <footer>
              <span>{tr("KONVEX | کانوکس")}</span>
              <span>{tr("ویرایش نمونه / ۱۴۰۵")}</span>
            </footer>
          </section>
          {sheets.map(({ category: c, part, products: members }, index) => (
            <section
              key={c.id + "-" + part}
              className="print-sheet print-category"
            >
              <header>
                <Brandmark small />
                <span dir="ltr">
                  {tr(c.english)} / 0{index + 1}
                </span>
              </header>
              <div className="print-category-title">
                <span className="eyebrow">{tr("خانواده محصولات")}</span>
                <h2>
                  {tr(c.name)}
                  {part > 0 && <small>{tr(" — ادامه")}</small>}
                </h2>
                <p>{tr(c.description)}</p>
              </div>
              <div className="print-products">
                {members.map((p) => (
                  <article key={p.id}>
                    <ProductImage
                      src={p.images[0]?.url || "/images/hero.webp"}
                      alt={tr(p.name)}
                      eager
                      sizes="120px"
                    />
                    <div>
                      <h3>{tr(p.name)}</h3>
                      <div className="print-product-codes">
                        <span>
                          {tr("مدل: ")}
                          <bdi>{tr(p.model)}</bdi>
                        </span>
                        <span>
                          {tr("کد: ")}
                          <bdi>{tr(p.sku)}</bdi>
                        </span>
                      </div>
                      <div className="print-specs">
                        {p.specifications.slice(0, 4).map((sp) => (
                          <span key={sp.key}>
                            {tr(sp.label)}:{" "}
                            <bdi
                              dir={
                                locale === "en" || isTechnical(sp.value)
                                  ? "ltr"
                                  : "rtl"
                              }
                            >
                              {tr(sp.value)}
                            </bdi>
                          </span>
                        ))}
                      </div>
                      <p>{tr(p.shortDescription)}</p>
                    </div>
                    <span className="print-inquiry">
                      {tr("قیمت و موجودی")}
                      <br />
                      {tr("با استعلام")}
                    </span>
                  </article>
                ))}
              </div>
              <div className="print-sample-warning compact">
                <strong>{tr("اطلاعات و تصاویر نمونه‌اند.")}</strong>
                <p>
                  {tr(
                    "مشخصات، سازگاری، موجودی و شرایط ضمانت باید پیش از سفارش با سند رسمی محصول تطبیق داده شوند.",
                  )}
                </p>
              </div>
              <footer>
                <span>KONVEX / {tr(c.name)}</span>
                <span>
                  {tr("نسخه نمونه — صفحه ")}
                  {fmtNumber(index + 2)}
                </span>
              </footer>
            </section>
          ))}
        </div>
      }
    </RuntimeTranslations>
  );
}
