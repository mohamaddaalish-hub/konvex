import { RuntimeTranslations } from "@/components/runtime-translations";
import { getI18n } from "@/i18n/server";
import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  MessageCircle,
  ArrowLeft,
  ArrowUpLeft,
  Send,
  Camera as Instagram,
  BriefcaseBusiness as Linkedin,
} from "lucide-react";
import { getSettings } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui";
import { ContactLink } from "@/components/contact-links";
import { localizedMetadata as meta } from "@/i18n/metadata";
export async function generateMetadata() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = await getI18n();
  return meta(
    tr("تماس با کانوکس"),
    tr(
      "راه‌های ارتباط، درخواست مشاوره و استعلام ابزار و تجهیزات صنعتی کانوکس.",
    ),
    "/contact",
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
  const s = getSettings();
  const channels = [
    {
      label: tr("تماس تلفنی"),
      value: s.phone,
      icon: Phone,
      href: s.phone ? `tel:${s.phone.replace(/\s/g, "")}` : "",
      event: "phone_click" as const,
    },
    {
      label: tr("واتس‌اپ"),
      value: s.whatsapp,
      icon: MessageCircle,
      href: s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` : "",
      event: "whatsapp_click" as const,
    },
    {
      label: tr("ایمیل"),
      value: s.email,
      icon: Mail,
      href: s.email ? `mailto:${s.email}` : "",
      event: "contact_click" as const,
    },
  ];
  return (
    <RuntimeTranslations dictionary={dictionary}>
      {
        <div className="container page-container contact-page">
          <Breadcrumb items={[{ name: tr("تماس با ما") }]} />
          <div className="page-title">
            <span className="eyebrow">
              <span />
              {tr("در ارتباط باشیم")}
            </span>
            <h1>{tr("گفت‌وگو را از کارتان شروع کنیم.")}</h1>
            <p>
              {tr(
                "برای انتخاب محصول، بررسی سازگاری یا استعلام قیمت، نیازتان را مطرح کنید.",
              )}
            </p>
          </div>
          <div className="contact-layout">
            <div>
              <div className="contact-channel-grid">
                {channels.map(({ label, value, icon: Icon, href, event }) => (
                  <section className="contact-channel" key={label}>
                    <Icon size={23} />
                    <h2>{tr(label)}</h2>
                    {value ? (
                      <ContactLink
                        event={event}
                        href={href}
                        className="contact-channel-value"
                      >
                        <bdi>{tr(value)}</bdi>
                        <ArrowUpLeft size={16} />
                      </ContactLink>
                    ) : (
                      <p className="contact-unconfigured">
                        {tr("اطلاعات این کانال هنوز ثبت نشده است.")}
                      </p>
                    )}
                  </section>
                ))}
              </div>
              <div className="contact-address">
                <div>
                  <MapPin size={22} />
                  <h2>{tr("نشانی مجموعه")}</h2>
                  <p>
                    {tr(
                      s.address ||
                        tr(
                          "نشانی رسمی پس از تأیید برند در این بخش درج می‌شود.",
                        ),
                    )}
                  </p>
                </div>
                <div>
                  <Clock3 size={22} />
                  <h2>{tr("ساعت پاسخ‌گویی")}</h2>
                  <p>{tr(s.hours || tr("ساعت کاری هنوز اعلام نشده است."))}</p>
                </div>
              </div>
              <div className="contact-map">
                <div className="map-grid-pattern" aria-hidden="true" />
                <MapPin size={32} />
                {s.mapUrl ? (
                  <>
                    <h3>{tr("مسیر دسترسی به کانوکس")}</h3>
                    <ContactLink
                      href={s.mapUrl}
                      event="contact_click"
                      className="button secondary small"
                    >
                      {tr("باز کردن نقشه")}
                      <ArrowUpLeft size={17} />
                    </ContactLink>
                  </>
                ) : (
                  <>
                    <h3>{tr("نقشه پس از ثبت نشانی فعال می‌شود.")}</h3>
                    <p>
                      {tr(
                        "برای جلوگیری از راهنمایی نادرست، مکان فرضی نمایش داده نمی‌شود.",
                      )}
                    </p>
                  </>
                )}
              </div>
              {(s.instagram || s.linkedin) && (
                <div className="contact-socials">
                  <span>{tr("شبکه‌های اجتماعی")}</span>
                  {s.instagram && (
                    <ContactLink href={s.instagram} event="contact_click">
                      <Instagram size={21} />
                      {tr("اینستاگرام")}
                    </ContactLink>
                  )}
                  {s.linkedin && (
                    <ContactLink href={s.linkedin} event="contact_click">
                      <Linkedin size={21} />
                      {tr("لینکدین")}
                    </ContactLink>
                  )}
                </div>
              )}
            </div>
            <aside className="contact-cta">
              <span className="eyebrow light">
                {tr("یک مسیر روشن برای ارتباط")}
              </span>
              <Send size={36} />
              <h2>
                {tr("نیازتان را بنویسید.")}
                <br />
                {tr("با جزئیات، بهتر می‌شود.")}
              </h2>
              <p>
                {tr(
                  "مدل محصول، تعداد و شرایط کاربرد را در فرم ثبت کنید و یک کد پیگیری دریافت کنید.",
                )}
              </p>
              <Link
                className="button primary full"
                href="/quote?purpose=consultation"
              >
                {tr("ثبت درخواست مشاوره")}
                <ArrowLeft size={19} />
              </Link>
              <Link className="button light-outline full" href="/quote">
                {tr("استعلام قیمت محصول")}
                <ArrowLeft size={19} />
              </Link>
              <div className="contact-cta-note">
                {tr(
                  "در نسخه آزمایشی، ثبت درخواست فعال است؛ ارسال پیامک، ایمیل و تماس واقعی فعال نیست.",
                )}
              </div>
            </aside>
          </div>
        </div>
      }
    </RuntimeTranslations>
  );
}
