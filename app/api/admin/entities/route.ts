import { jsonLocalized } from "@/lib/api-i18n";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { categorySchema, brandSchema, articleSchema } from "@/lib/validation";
import { saveEntity, getEntity, getEntities, categoryIds } from "@/lib/catalog";
import { getDB } from "@/lib/db";
import type { Category, Article } from "@/lib/types";
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  try {
    const { type, data } = await readJsonBody(req, 400000);
    const schema =
      type === "category"
        ? categorySchema
        : type === "brand"
          ? brandSchema
          : type === "article"
            ? articleSchema
            : null;
    if (!schema)
      return jsonLocalized(
        req,
        { error: "نوع محتوا معتبر نیست." },
        { status: 422 },
      );
    const result = schema.safeParse(data);
    if (!result.success)
      return jsonLocalized(
        req,
        {
          error: "فیلدها را بررسی کنید.",
          details: result.error.issues
            .map((i) => i.path.join(".") + ": " + i.message)
            .join(" / "),
        },
        { status: 422 },
      );
    if (type === "category") {
      const c = result.data as Category;
      if (
        c.parentId &&
        (!getEntity("category", c.parentId) ||
          c.parentId === c.id ||
          categoryIds(c.id).includes(c.parentId))
      )
        return jsonLocalized(
          req,
          { error: "دسته والد معتبر نیست؛ ساختار حلقه‌ای مجاز نیست." },
          { status: 422 },
        );
    }
    if (type === "article") {
      const a = result.data as Article;
      if (a.relatedCategory && !getEntity("category", a.relatedCategory))
        return jsonLocalized(
          req,
          { error: "دسته مرتبط مقاله وجود ندارد." },
          { status: 422 },
        );
    }
    saveEntity(type, result.data);
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "ذخیره انجام نشد؛ آدرس یا شناسه ممکن است تکراری باشد." },
      { status: 409 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  try {
    const { type, id } = await readJsonBody(req, 400000);
    if (
      !["category", "brand", "article"].includes(type) ||
      typeof id !== "string"
    )
      return jsonLocalized(
        req,
        { error: "درخواست نامعتبر است." },
        { status: 422 },
      );
    const db = getDB();
    if (
      type === "category" &&
      getEntities<Category>("category").some((c) => c.parentId === id)
    )
      return jsonLocalized(
        req,
        { error: "ابتدا زیرگروه‌ها را منتقل یا حذف کنید." },
        { status: 409 },
      );
    if (
      type === "category" &&
      getEntities<Article>("article").some((a) => a.relatedCategory === id)
    )
      return jsonLocalized(
        req,
        { error: "ابتدا دسته مرتبط مقاله‌ها را تغییر دهید." },
        { status: 409 },
      );
    if (type !== "article") {
      const field = type === "category" ? "category_id" : "brand_id";
      const count = (
        db
          .prepare(`SELECT COUNT(*) n FROM products WHERE ${field}=?`)
          .get(id) as { n: number }
      ).n;
      if (count)
        return jsonLocalized(
          req,
          { error: "ابتدا محصولات این گروه را منتقل یا حذف کنید." },
          { status: 409 },
        );
    }
    db.prepare("DELETE FROM entities WHERE type=? AND id=?").run(type, id);
    db.prepare(
      "DELETE FROM content_translations WHERE type=? AND entity_id=?",
    ).run(type, id);
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(req, { error: "حذف انجام نشد." }, { status: 500 });
  }
}
