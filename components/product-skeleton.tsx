import { useI18n } from "@/i18n/use-i18n";
export default function Loading() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div
      className="container loading-page"
      aria-busy="true"
      aria-label={tr("در حال بارگذاری محصول")}
    >
      <div
        className="skeleton"
        style={{ width: 200, height: 16, marginBottom: 32 }}
      />
      <div className="product-detail-main">
        <div className="skeleton" style={{ aspectRatio: "1.12" }} />
        <div>
          <div className="skeleton" style={{ height: 44, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 120, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 80, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 48 }} />
        </div>
      </div>
    </div>
  );
}
