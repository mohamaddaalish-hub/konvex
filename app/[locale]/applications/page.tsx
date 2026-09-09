import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowUpLeft,
  Building2,
  Factory,
  Settings2,
  Hammer,
  Layers,
  ScanLine,
} from "lucide-react";
import { getApplications, queryProducts } from "@/lib/catalog";
import { Breadcrumb, ProductImage, ConsultationCTA } from "@/components/ui";
import { faNumber } from "@/lib/format";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("انتخاب ابزار بر اساس کاربرد"),
    tr(
      "ابزار مناسب ساختمان، کارگاه، صنعت، فلزکاری، بتن و تجهیزات را پیدا کنید.",
    ),
    "/applications",
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
  const apps = getApplications(),
    icons = [Building2, Hammer, Factory, ScanLine, Layers, Settings2];
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <>
          <div className="container page-container">
            <Breadcrumb items={[{ name: tr("کاربردها") }]} />
            <div className="applications-intro">
              <div>
                <span className="eyebrow">
                  <span />
                  {tr("از مسئله به محصول")}
                </span>
                <h1>
                  {tr("چه کاری")}
                  <br />
                  {tr("پیش رو دارید؟")}
                </h1>
                <p>
                  {tr("لازم نیست از نام ابزار شروع کنید.")}
                  <br />
                  {tr(
                    "محیط و نوع کارتان را انتخاب کنید تا به مجموعه مرتبط برسید.",
                  )}
                </p>
              </div>
              <ProductImage
                src="/images/workshop.webp"
                alt={tr("تصویر مفهومی استفاده از ابزار در کارگاه فلزکاری")}
                eager
                sizes="(max-width: 768px) 100vw, 55vw"
                width={1376}
                height={768}
              />
            </div>
            <div className="application-directory">
              {apps.map((a, i) => {
                const Icon = icons[i] || Factory;
                const count = queryProducts({
                  application: a.id,
                  pageSize: 1,
                }).total;
                return (
                  <Link href={`/applications/${a.slug}`} key={a.id}>
                    <div className="application-directory-top">
                      <Icon size={27} />
                      <span dir="ltr">
                        0{i + 1} / {tr(a.slug.toUpperCase())}
                      </span>
                    </div>
                    <h2>{tr(a.name)}</h2>
                    <h3>{tr(a.title)}</h3>
                    <p>{tr(a.description)}</p>
                    <span className="application-directory-link">
                      {fmtNumber(count)}
                      {tr(" محصول مرتبط")}
                      <ArrowLeft size={19} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          <ConsultationCTA />
        </>
      }
    </RuntimeTranslations>
  );
}
