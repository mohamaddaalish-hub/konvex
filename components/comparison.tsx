"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useState } from "react";
import Link from "@/i18n/navigation";
import {
  X,
  Plus,
  ArrowLeft,
  GitCompareArrows,
  Trash2,
  MoveHorizontal,
} from "lucide-react";
import { useStore } from "./store";
import { ProductImage, EmptyState } from "./ui";
import { faNumber, isTechnical } from "@/lib/format";
import type { Category } from "@/lib/types";
export function Comparison({ categories }: { categories: Category[] }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { compare, removeCompare, clearCompare, ready } = useStore();
  const [differences, setDifferences] = useState(false);
  const category = categories.find((c) => c.id === compare[0]?.categoryId);
  const keys = Array.from(
    new Set(compare.flatMap((p) => p.specifications.map((s) => s.key))),
  );
  const technical = keys.map((key) => ({
    key,
    label: compare.flatMap((p) => p.specifications).find((s) => s.key === key)!
      .label,
    values: compare.map(
      (p) =>
        p.specifications.find((s) => s.key === key)?.value || tr("ثبت نشده"),
    ),
  }));
  const rows = [
    { key: "brand", label: tr("برند"), values: compare.map((p) => p.brand) },
    {
      key: "price",
      label: tr("قیمت"),
      values: compare.map((p) =>
        p.price === null
          ? tr("نیازمند استعلام")
          : tr("{v0} تومان", { v0: tr(fmtNumber(p.price)) }),
      ),
    },
    ...technical,
    {
      key: "stock",
      label: tr("موجودی"),
      values: compare.map((p) =>
        p.availability === "in_stock"
          ? tr("موجود")
          : p.availability === "unavailable"
            ? tr("ناموجود")
            : tr("نیازمند استعلام"),
      ),
    },
    {
      key: "warranty",
      label: tr("ضمانت"),
      values: compare.map(() => tr("نیازمند تأیید")),
    },
  ];
  const visible = rows.filter(
    (r) => !differences || new Set(r.values).size > 1,
  );
  if (!ready) return <div className="skeleton compare-skeleton" />;
  if (!compare.length)
    return (
      <EmptyState
        title={tr("انتخاب‌های شما هنوز کنار هم نیستند.")}
        description={tr(
          "از روی کارت یا صفحه محصول، گزینه مقایسه را انتخاب کنید. می‌توانید تا سه محصول از یک دسته را کنار هم ببینید.",
        )}
        actionLabel={tr("انتخاب محصولات برای مقایسه")}
      />
    );
  return (
    <>
      <div className="compare-toolbar">
        <div>
          <GitCompareArrows size={20} />
          <span>
            {fmtNumber(compare.length)}
            {tr(" محصول از دسته")} <strong>{tr(category?.name)}</strong>
          </span>
        </div>
        <label className="switch-label">
          <input
            type="checkbox"
            checked={differences}
            onChange={(e) => setDifferences(e.target.checked)}
            disabled={compare.length < 2}
          />
          <span className="switch" />
          {tr("فقط تفاوت‌ها")}
        </label>
        <button className="text-link" onClick={clearCompare}>
          <Trash2 size={16} />
          {tr("پاک کردن مقایسه")}
        </button>
      </div>
      {compare.length < 2 && (
        <div className="comparison-hint">
          {tr(
            "برای دیدن تفاوت‌ها، حداقل یک محصول دیگر از همین دسته انتخاب کنید.",
          )}
        </div>
      )}
      <p className="comparison-scroll-hint">
        <MoveHorizontal size={18} aria-hidden="true" />
        {tr("برای دیدن سایر مدل‌ها، جدول را به طرفین بکشید.")}
      </p>
      <div
        className="comparison-scroll"
        tabIndex={0}
        role="region"
        aria-label={tr(
          "جدول مقایسه محصولات؛ در صفحه کوچک به طرفین پیمایش کنید",
        )}
      >
        <table className="comparison-table">
          <caption className="sr-only">
            {tr("مقایسه مشخصات محصولات ")}
            {tr(category?.name)}
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <span>
                  {tr("یک نگاه.")}
                  <br />
                  {tr("تمام تفاوت‌ها.")}
                </span>
                <small>{tr("مشخصات کاتالوگ نمونه")}</small>
              </th>
              {compare.map((p) => (
                <th scope="col" key={p.id}>
                  <div className="compare-product-head">
                    <button
                      className="icon-button compare-remove"
                      onClick={() => removeCompare(p.id)}
                      aria-label={tr("حذف {v0} از مقایسه", { v0: tr(p.name) })}
                    >
                      <X size={18} />
                    </button>
                    <Link href={`/product/${p.slug}`}>
                      <ProductImage
                        src={p.images[0]?.url || "/images/hero.webp"}
                        alt={tr(p.name)}
                        sizes="220px"
                      />
                    </Link>
                    <bdi>{tr(p.model)}</bdi>
                    <Link
                      className="compare-product-name"
                      href={`/product/${p.slug}`}
                    >
                      {tr(p.name)}
                    </Link>
                    <Link
                      className="button primary small"
                      href={`/quote?product=${p.id}`}
                    >
                      {tr("درخواست قیمت")}
                      <ArrowLeft size={15} />
                    </Link>
                  </div>
                </th>
              ))}
              {compare.length < 3 && (
                <th scope="col" className="compare-empty-cell">
                  <Link
                    className="compare-add"
                    href={`/products/${category?.slug || ""}`}
                  >
                    <span>
                      <Plus size={24} />
                    </span>
                    {tr("افزودن محصول")}
                    <br />
                    {tr("از همین دسته")}
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.key}
                className={new Set(r.values).size > 1 ? "has-difference" : ""}
              >
                <th scope="row">{tr(r.label)}</th>
                {r.values.map((v, i) => (
                  <td key={i}>
                    <bdi
                      dir={locale === "en" || isTechnical(v) ? "ltr" : "rtl"}
                    >
                      {tr(v)}
                    </bdi>
                  </td>
                ))}
                {compare.length < 3 && (
                  <td className="compare-empty-cell">—</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {differences && visible.length === 0 && (
          <div className="compare-no-differences">
            {tr(
              "در مشخصات ثبت‌شده تفاوتی پیدا نشد. نمایش «فقط تفاوت‌ها» را خاموش کنید.",
            )}
          </div>
        )}
      </div>
      <div className="comparison-bottom">
        <p>
          {tr(
            "اطلاعات این نسخه نمونه‌اند. شرایط ضمانت، موجودی و قیمت باید پیش از سفارش تأیید شوند.",
          )}
        </p>
        <Link
          className="button primary"
          href={`/quote?products=${compare.map((p) => p.id).join(",")}`}
        >
          {tr("استعلام محصولات انتخاب‌شده")}
          <ArrowLeft size={18} />
        </Link>
      </div>
    </>
  );
}
