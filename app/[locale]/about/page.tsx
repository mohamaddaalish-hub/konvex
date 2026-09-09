import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import {
  ArrowLeft,
  ScanLine,
  Layers3,
  MessagesSquare,
  GitCompareArrows,
} from "lucide-react";
import {
  Breadcrumb,
  ProductImage,
  SectionHeading,
  ConsultationCTA,
} from "@/components/ui";
import { getCategories, queryProducts } from "@/lib/catalog";
import { faNumber } from "@/lib/format";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("درباره کانوکس"),
    tr(
      "نگاه کانوکس به ابزار و تجهیزات صنعتی؛ انتخاب متناسب با نیاز و مشخصات شفاف.",
    ),
    "/about",
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
  const main = getCategories().filter((c) => c.id !== "accessories");
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <>
          <div className="container">
            <Breadcrumb items={[{ name: tr("درباره کانوکس") }]} />
            <section className="about-hero">
              <div>
                <span className="eyebrow">
                  <span />
                  {tr("KONVEX / نگاه ما")}
                </span>
                <h1>
                  {tr("پشت هر کار دقیق،")}
                  <br />
                  {tr("یک انتخاب درست است.")}
                </h1>
                <p>
                  {tr(
                    "کانوکس، مجموعه‌ای در حوزه ابزار و تجهیزات صنعتی است. اینجا، نقطه شروع انتخاب نه ظاهر ابزار، بلکه کاری است که باید انجام شود.",
                  )}
                </p>
                <p>
                  {tr(
                    "با کنار هم گذاشتن مشخصات، کاربردها و تفاوت مدل‌ها، مسیر انتخاب را روشن‌تر می‌کنیم؛ تا برای تصمیم بعدی اطلاعات بهتری در اختیار داشته باشید.",
                  )}
                </p>
                <Link className="text-link" href="/products">
                  {tr("آشنایی با خانواده محصولات")}
                  <ArrowLeft size={18} />
                </Link>
              </div>
              <div className="about-hero-image">
                <ProductImage
                  src="/images/hero.webp"
                  alt={tr("تصویر اختصاصی نمونه از خانواده ابزارهای کانوکس")}
                  eager
                  sizes="(max-width: 768px) 100vw, 55vw"
                  width={1264}
                  height={848}
                />
                <span dir="ltr">PRECISION IN EVERY DETAIL.</span>
              </div>
            </section>
            <div className="about-facts">
              <div>
                <b>{fmtNumber(main.length)}</b>
                <span>{tr("حوزه تخصصی محصول")}</span>
              </div>
              <div>
                <b>{fmtNumber(queryProducts({ pageSize: 1 }).total)}</b>
                <span>{tr("مدل در کاتالوگ نمونه")}</span>
              </div>
              <div>
                <b>{tr("۳")}</b>
                <span>{tr("مسیر کشف: دسته، کاربرد، جستجو")}</span>
              </div>
              <div>
                <span className="fact-statement">{tr("یک اصل روشن")}</span>
                <strong>{tr("تناسب ابزار با نیاز واقعی")}</strong>
              </div>
            </div>
            <section className="section">
              <SectionHeading
                eyebrow={tr("روش کار ما در این کاتالوگ")}
                title={tr("از نیاز شما شروع می‌کنیم.")}
              />
              <div className="about-steps">
                {[
                  {
                    title: tr("شناخت کار"),
                    text: tr(
                      "محیط، جنس قطعه‌کار و نتیجه موردانتظار را مشخص کنید.",
                    ),
                    icon: MessagesSquare,
                  },
                  {
                    title: tr("بررسی مشخصات"),
                    text: tr(
                      "ابعاد، ظرفیت، دقت و سایر ویژگی‌های تصمیم‌ساز را بخوانید.",
                    ),
                    icon: ScanLine,
                  },
                  {
                    title: tr("مقایسه انتخاب‌ها"),
                    text: tr(
                      "مدل‌های هم‌دسته را کنار هم ببینید و تفاوت‌ها را بررسی کنید.",
                    ),
                    icon: GitCompareArrows,
                  },
                  {
                    title: tr("استعلام نهایی"),
                    text: tr(
                      "قیمت، موجودی، سازگاری و شرایط تأمین را پیش از سفارش تأیید کنید.",
                    ),
                    icon: Layers3,
                  },
                ].map(({ title, text, icon: Icon }, i) => (
                  <div key={title}>
                    <span className="step-no" dir="ltr">
                      0{i + 1}
                    </span>
                    <Icon size={28} />
                    <h3>{tr(title)}</h3>
                    <p>{tr(text)}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="about-statement">
              <span className="eyebrow">
                <span />
                {tr("قول ما در تجربه انتخاب")}
              </span>
              <h2>
                {tr("اطلاعات کمترِ مبهم.")}
                <br />
                <span>{tr("جزئیات بیشترِ کاربردی.")}</span>
              </h2>
              <p>
                {tr(
                  "سوابق، گواهی‌ها، شرایط ضمانت و اطلاعات تجاری فقط پس از تأیید برند به سایت اضافه می‌شوند. اعتماد، با اطلاعات قابل بررسی ساخته می‌شود؛ نه عدد و نشان تزئینی.",
                )}
              </p>
            </section>
          </div>
          <ConsultationCTA />
        </>
      }
    </RuntimeTranslations>
  );
}
