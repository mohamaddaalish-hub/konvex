import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalog";
import { getDictionary } from "@/lib/content-translations";
import { requestLocale, jsonLocalized } from "@/lib/api-i18n";
import { makeI18n } from "@/i18n/core";
import fs from "node:fs";
import path from "node:path";
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params,
    p = getProduct(id);
  if (!p)
    return jsonLocalized(req, { error: "محصول پیدا نشد." }, { status: 404 });
  const locale = requestLocale(req),
    { t } = makeI18n(locale, getDictionary({ fullProducts: [p.id] }));
  const text = (s: string) => esc(t(s));
  const font = fs
    .readFileSync(
      path.join(
        process.cwd(),
        "public/fonts",
        locale === "en" ? "Inter-latin.woff2" : "Vazirmatn.woff2",
      ),
    )
    .toString("base64");
  const html = `<!doctype html><html lang="${locale}" dir="${locale === "en" ? "ltr" : "rtl"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${text(p.name)} | KONVEX</title><style>@font-face{font-family:UI;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{font:14px/1.9 UI,Arial;max-width:860px;margin:40px auto;padding:24px;color:#14241c;background:#fff}header{border-bottom:2px solid #167451;padding-bottom:18px;display:flex;justify-content:space-between;gap:20px}.brand{font:bold italic 30px Arial;color:#167451}h1{font-size:28px;line-height:1.5}h2{font-size:19px;margin-top:30px}p{color:#53655b;white-space:pre-line}table{border-collapse:collapse;width:100%;margin:24px 0}td,th{padding:11px 18px;border-bottom:1px solid #d6e1d9;text-align:start;overflow-wrap:anywhere}th{background:#edf5ef;width:40%;font-weight:500}.note{background:#e5f2ea;padding:15px;border:1px solid #bad8c6;border-radius:8px;font-size:12px}footer{border-top:1px solid #d6e1d9;margin-top:32px;padding-top:16px;font-size:11px;color:#53655b}@media print{body{margin:0;max-width:none;padding:0}tr{break-inside:avoid}}</style></head><body><header><span class="brand" dir="ltr">KONVEX</span><span>${text("برگه مشخصات محصول")}</span></header><h1>${text(p.name)}</h1><p>${text("مدل:")} <bdi>${esc(p.model)}</bdi> · ${text("کد کالا:")} <bdi>${esc(p.sku)}</bdi></p>${p.isSample ? `<div class="note">${text("کاتالوگ نمونه: این اطلاعات تأییدشده نیست و نباید مبنای سفارش یا تصمیم ایمنی قرار گیرد.")}</div>` : ""}<p>${text(p.shortDescription)}</p><h2>${text("مشخصات فنی")}</h2><table><tbody>${p.specifications.map((s) => `<tr><th scope="row">${text(s.label)}</th><td><bdi>${text(s.value)}</bdi></td></tr>`).join("")}</tbody></table><h2>${text("کاربرد و توضیحات")}</h2><p>${text(p.longDescription)}</p><h2>${text("شرایط ضمانت")}</h2><p>${text(p.warranty)}</p><footer>${text("این فایل از اطلاعات فعلی کاتالوگ تولید شده است. برای ذخیره به PDF از گزینه چاپ مرورگر استفاده کنید.")} · ${esc(p.updatedAt.slice(0, 10))}</footer></body></html>`;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="konvex-${p.sku.replace(/[^a-z0-9-]/gi, "-")}-datasheet${locale === "en" ? "-en" : ""}.html"`,
      "Cache-Control": "no-store",
    },
  });
}
