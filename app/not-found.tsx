import { useI18n } from "@/i18n/use-i18n";
import Link from "@/i18n/navigation";
import { ArrowLeft, Search, MoveUpRight } from "lucide-react";
export default function NotFound() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <div className="container not-found">
      <span className="error-number" dir="ltr">
        404<span> / OFF THE GRID</span>
      </span>
      <div className="eyebrow">
        <span />
        {tr("مسیر پیدا نشد")}
      </div>
      <h1>{tr("این مسیر به محصولی نمی‌رسد.")}</h1>
      <p>
        {tr(
          "ممکن است آدرس تغییر کرده باشد یا صفحه موردنظر دیگر در دسترس نباشد.",
        )}
        <br />
        {tr("از کاتالوگ یا جستجو، مسیر تازه‌ای پیدا کنید.")}
      </p>
      <div>
        <Link href="/products" className="button primary">
          {tr("رفتن به محصولات")}
          <ArrowLeft size={18} />
        </Link>
        <Link href="/search" className="button secondary">
          <Search size={18} />
          {tr("جستجوی محصول")}
        </Link>
      </div>
      <Link href="/" className="text-link">
        {tr("بازگشت به خانه")}
        <ArrowLeft size={17} />
      </Link>
    </div>
  );
}
