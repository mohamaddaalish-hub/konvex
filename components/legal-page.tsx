import { useI18n } from "@/i18n/use-i18n";
import { Breadcrumb } from "./ui";
import Link from "@/i18n/navigation";
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: {
    title: string;
    body: string;
  }[];
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div className="container page-container legal-page">
      <Breadcrumb items={[{ name: title }]} />
      <header className="page-title">
        <span className="eyebrow">
          <span />
          {tr("شفافیت در استفاده")}
        </span>
        <h1>{tr(title)}</h1>
        <p>{tr(intro)}</p>
      </header>
      <div className="legal-draft">
        {tr(
          "پیش‌نویس مربوط به نسخه آزمایشی — سیاست نهایی باید پیش از انتشار تجاری توسط مالک مجموعه تأیید شود.",
        )}
      </div>
      {sections.map((s, i) => (
        <section key={s.title}>
          <h2>
            {tr((i + 1).toLocaleString("fa-IR"))}. {tr(s.title)}
          </h2>
          <p>{tr(s.body)}</p>
        </section>
      ))}
      <Link className="button secondary" href="/contact">
        {tr("پرسش درباره این سیاست")}
      </Link>
    </div>
  );
}
