"use client";
import { useI18n } from "@/i18n/use-i18n";

import Link from "@/i18n/navigation";
import { RefreshCw, TriangleAlert } from "lucide-react";
export default function ErrorPage({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div className="container route-error">
      <TriangleAlert size={46} />
      <h1>{tr("ارتباط با سرور برقرار نشد.")}</h1>
      <p>
        {tr(
          "اطلاعات صفحه بارگذاری نشد. دوباره تلاش کنید؛ مسیر انتخاب شما همچنان در دسترس است.",
        )}
      </p>
      <div>
        <button className="button primary" onClick={reset}>
          <RefreshCw size={18} />
          {tr("تلاش مجدد")}
        </button>
        <Link href="/" className="button secondary">
          {tr("بازگشت به خانه")}
        </Link>
      </div>
    </div>
  );
}
