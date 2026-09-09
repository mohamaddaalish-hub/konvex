import { NextRequest } from "next/server";
import { getProduct, summary } from "@/lib/catalog";
import { rateLimit } from "@/lib/security";
import { jsonLocalized } from "@/lib/api-i18n";
export async function GET(req: NextRequest) {
  if (!rateLimit(req, "selections", 90, 60000))
    return jsonLocalized(
      req,
      { error: "کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  const ids = [
    ...new Set(
      (req.nextUrl.searchParams.get("ids") || "")
        .split(",")
        .filter((s) => /^[a-z0-9_-]{1,100}$/i.test(s)),
    ),
  ].slice(0, 150);
  const products = ids
    .map(getProduct)
    .filter((p) => !!p)
    .map(summary);
  return jsonLocalized(
    req,
    { products },
    { headers: { "Cache-Control": "no-store" } },
  );
}
