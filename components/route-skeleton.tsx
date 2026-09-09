import { useI18n } from "@/i18n/use-i18n";
export default function Loading() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div
      className="container loading-page"
      aria-busy="true"
      aria-label={tr("در حال بارگذاری صفحه")}
    >
      <div
        className="skeleton"
        style={{ width: 180, height: 16, marginBottom: 36 }}
      />
      <div
        className="skeleton"
        style={{ width: "55%", height: 46, marginBottom: 20 }}
      />
      <div
        className="skeleton"
        style={{ width: "75%", height: 18, marginBottom: 40 }}
      />
      <div className="product-grid">
        {[0, 1, 2, 3].map((n) => (
          <div className="product-skeleton skeleton" key={n} />
        ))}
      </div>
    </div>
  );
}
