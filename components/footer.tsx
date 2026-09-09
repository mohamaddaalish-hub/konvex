"use client";
import { MotionSwitcher } from "./preferences";
import { useI18n } from "@/i18n/use-i18n";

import Link from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  ArrowUpLeft,
  Phone,
  Mail,
  Camera as Instagram,
  BriefcaseBusiness as Linkedin,
} from "lucide-react";
import type { Category, SiteSettings } from "@/lib/types";
import { Brandmark } from "./ui";
import { track } from "@/lib/analytics";
export function Footer({
  categories,
  settings,
}: {
  categories: Category[];
  settings: SiteSettings;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const pathname = usePathname();
  if (pathname.startsWith("/print") || pathname.startsWith("/admin"))
    return null;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/">
              <Brandmark
                dark
                name={settings.englishName}
                persian={settings.name}
              />
            </Link>
            <p>
              {tr("ابزار درست، برای کارِ درست.")}
              <br />
              {tr("کاتالوگ تخصصی ابزار و تجهیزات صنعتی؛")}
              <br />
              {tr("با نگاهی دقیق به نیاز حرفه‌ای‌ها.")}
            </p>
            <span className="footer-brand-line" />
          </div>
          <div className="footer-links">
            <h2>{tr("محصولات")}</h2>
            {categories.map((c) => (
              <Link key={c.id} href={`/products/${c.slug}`}>
                {tr(c.name)}
              </Link>
            ))}
          </div>
          <div className="footer-links">
            <h2>{tr("دسترسی سریع")}</h2>
            <Link href="/about">{tr("درباره کانوکس")}</Link>
            <Link href="/applications">{tr("انتخاب بر اساس کاربرد")}</Link>
            <Link href="/knowledge">{tr("دانشنامه ابزار")}</Link>
            <Link href="/new-products">{tr("محصولات جدید")}</Link>
            <Link href="/compare">{tr("مقایسه محصولات")}</Link>
            <Link href="/wishlist">{tr("ذخیره‌شده‌ها")}</Link>
          </div>
          <div className="footer-contact">
            <h2>{tr("در ارتباط باشیم.")}</h2>
            <p>
              {tr("برای انتخاب محصول و استعلام قیمت،")}
              <br />
              {tr("نیاز پروژه‌تان را با ما در میان بگذارید.")}
            </p>
            <Link
              href="/quote?purpose=consultation"
              className="footer-contact-link"
              onClick={() => track("contact_click", { location: "footer" })}
            >
              {tr("درخواست تماس و مشاوره")}
              <ArrowUpLeft size={20} />
            </Link>
            {settings.phone && (
              <a
                className="contact-line"
                dir="ltr"
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                onClick={() => track("phone_click")}
              >
                <Phone size={16} />
                {tr(settings.phone)}
              </a>
            )}
            {settings.email && (
              <a
                className="contact-line"
                dir="ltr"
                href={`mailto:${settings.email}`}
              >
                <Mail size={16} />
                {tr(settings.email)}
              </a>
            )}
            {settings.address && (
              <p className="footer-address">{tr(settings.address)}</p>
            )}
            <div className="footer-socials">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  aria-label={tr("اینستاگرام کانوکس")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} />
                </a>
              )}
              {settings.linkedin && (
                <a
                  href={settings.linkedin}
                  aria-label={tr("لینکدین کانوکس")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={20} />
                </a>
              )}
              <Link className="text-link" href="/contact">
                {tr("راه‌های ارتباطی")}
                <ArrowUpLeft size={15} />
              </Link>
            </div>
          </div>
        </div>
        {settings.sampleMode && (
          <div className="footer-sample">
            <span />
            {tr(
              "نسخه نمایشی — اطلاعات و تصاویر محصولات نمونه‌اند. درخواست‌ها در محیط آزمایشی ذخیره می‌شوند.",
            )}
          </div>
        )}
        <div className="footer-bottom">
          <MotionSwitcher />
          <p>
            ©{" "}
            {tr(
              new Date().toLocaleDateString(
                locale === "en" ? "en-GB" : "fa-IR",
                {
                  year: "numeric",
                  timeZone: "Asia/Tehran",
                },
              ),
            )}{" "}
            {tr("کانوکس. تمامی حقوق محفوظ است.")}
          </p>
          <div>
            <Link href="/privacy">{tr("حریم خصوصی")}</Link>
            <span>/</span>
            <Link href="/terms">{tr("شرایط استفاده")}</Link>
          </div>
          <span className="footer-signature" dir="ltr">
            KONVEX. BUILT FOR THE WORK.
          </span>
        </div>
      </div>
    </footer>
  );
}
