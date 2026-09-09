import { jsonLocalized } from "@/lib/api-i18n";
import { NextRequest, NextResponse } from "next/server";
import { queryProducts, getCategories } from "@/lib/catalog";
import { requestI18n } from "@/lib/api-i18n";
import { normalizeSearch } from "@/lib/format";
import { rateLimit } from "@/lib/security";
export async function GET(req: NextRequest) {
  if (!rateLimit(req, "search", 180, 60000))
    return jsonLocalized(
      req,
      { error: "تعداد جستجوها زیاد است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  try {
    const q = req.nextUrl.searchParams.get("q")?.slice(0, 200) || "";
    const category = req.nextUrl.searchParams.get("category") || undefined;
    const data = queryProducts({ query: q, category, pageSize: 6 });
    const normalized = normalizeSearch(q);
    const { t } = requestI18n(
      new Request(req.url, { headers: { "x-konvex-locale": "en" } }),
    );
    const categories = getCategories().filter(
      (c) =>
        !q ||
        normalizeSearch(c.name + " " + c.english + " " + t(c.name)).includes(
          normalized,
        ),
    );
    const suggested = data.total
      ? []
      : queryProducts({ category, pageSize: 3 }).products;
    return jsonLocalized(
      req,
      {
        products: data.products,
        total: data.total,
        categories: categories.slice(0, 6),
        suggested,
      },
      { headers: { "Cache-Control": "private, max-age=15" } },
    );
  } catch {
    return jsonLocalized(
      req,
      { error: "ارتباط با کاتالوگ برقرار نشد. دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
