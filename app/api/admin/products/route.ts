import { jsonLocalized } from "@/lib/api-i18n";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, rateLimit } from "@/lib/security";
import { productSchema } from "@/lib/validation";
import {
  getProduct,
  getEntity,
  saveProduct,
  deleteProduct,
} from "@/lib/catalog";
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(
      req,
      { error: "نشست مدیریت معتبر نیست." },
      { status: 403 },
    );
  if (!rateLimit(req, "admin-write", 100, 60000))
    return jsonLocalized(
      req,
      { error: "کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  try {
    const validation = productSchema.safeParse(await readJsonBody(req, 200000));
    if (!validation.success)
      return jsonLocalized(
        req,
        {
          error: "اطلاعات محصول معتبر نیست.",
          details: validation.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(" / "),
        },
        { status: 422 },
      );
    const p = validation.data;
    if (!getEntity("category", p.categoryId) || !getEntity("brand", p.brandId))
      return jsonLocalized(
        req,
        { error: "برند یا دسته انتخاب‌شده وجود ندارد." },
        { status: 422 },
      );
    if (p.applications.some((a) => !getEntity("application", a)))
      return jsonLocalized(
        req,
        { error: "یکی از کاربردها معتبر نیست." },
        { status: 422 },
      );
    if (
      [
        ...p.relatedProductIds,
        ...p.compatibleProductIds,
        ...p.accessoryIds,
      ].some((id) => id === p.id || !getProduct(id))
    )
      return jsonLocalized(
        req,
        { error: "محصول مرتبط یا متعلقات معتبر نیست." },
        { status: 422 },
      );
    saveProduct({
      ...p,
      brand: getEntity<{ name: string }>("brand", p.brandId)!.name,
      updatedAt: new Date().toISOString(),
    });
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    const duplicate = e instanceof Error && e.message.includes("UNIQUE");
    return jsonLocalized(
      req,
      {
        error: duplicate
          ? "کد کالا یا آدرس محصول تکراری است."
          : "ذخیره محصول انجام نشد.",
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  try {
    const { id } = await readJsonBody(req, 200000);
    if (typeof id !== "string" || !getProduct(id))
      return jsonLocalized(req, { error: "محصول پیدا نشد." }, { status: 404 });
    deleteProduct(id);
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "حذف محصول انجام نشد." },
      { status: 500 },
    );
  }
}
export async function GET(req: NextRequest) {
  const { validSession } = await import("@/lib/security");
  if (!validSession(req.cookies.get("kv-admin")?.value || ""))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return jsonLocalized(
      req,
      { error: "شناسه محصول لازم است." },
      { status: 422 },
    );
  const product = getProduct(id);
  return product
    ? jsonLocalized(
        req,
        { product },
        { headers: { "Cache-Control": "no-store" } },
      )
    : jsonLocalized(req, { error: "محصول پیدا نشد." }, { status: 404 });
}
