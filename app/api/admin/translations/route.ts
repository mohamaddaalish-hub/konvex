import { NextRequest } from "next/server";
import { validSession, requireAdmin, rateLimit } from "@/lib/security";
import { getDB } from "@/lib/db";
import {
  getDictionary,
  contentFields,
  readTranslation,
  saveTranslation,
  reindexTranslatedProduct,
  type TranslationFields,
} from "@/lib/content-translations";
import { jsonLocalized } from "@/lib/api-i18n";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { categoryIds } from "@/lib/catalog";
const types = [
  "product",
  "category",
  "brand",
  "application",
  "article",
  "settings",
];
function source(type: string, id: string) {
  const db = getDB();
  const row = (
    type === "product"
      ? db.prepare("SELECT data FROM products WHERE id=?").get(id)
      : type === "settings"
        ? db.prepare("SELECT data FROM settings WHERE id=1").get()
        : db
            .prepare("SELECT data FROM entities WHERE type=? AND id=?")
            .get(type, id)
  ) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}
export async function GET(req: NextRequest) {
  if (!validSession(req.cookies.get("kv-admin")?.value || ""))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 401 });
  const type = req.nextUrl.searchParams.get("type") || "product";
  if (!types.includes(type))
    return jsonLocalized(
      req,
      { error: "نوع محتوا معتبر نیست." },
      { status: 422 },
    );
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const value = source(type, id);
    if (!value)
      return jsonLocalized(req, { error: "محتوا پیدا نشد." }, { status: 404 });
    return jsonLocalized(
      req,
      {
        id,
        type,
        name: value.name || value.title || "KONVEX",
        dictionary: getDictionary(
          type === "product"
            ? { products: [id] }
            : type === "article"
              ? { articles: [id] }
              : {},
        ),
        source: contentFields(value),
        translation: readTranslation(type, id),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  const db = getDB(),
    q = (req.nextUrl.searchParams.get("q") || "").slice(0, 100),
    page = Math.max(
      1,
      parseInt(req.nextUrl.searchParams.get("page") || "1") || 1,
    ),
    size = 20;
  let records: { id: string; value: any }[] = [],
    total = 0;
  if (type === "product") {
    const filter = q
      ? "WHERE name LIKE ? OR model LIKE ? OR sku LIKE ? OR id IN (SELECT entity_id FROM content_translations WHERE type='product' AND data LIKE ?)"
      : "";
    const args = q ? Array(4).fill("%" + q + "%") : [];
    total = (
      db.prepare(`SELECT count(*) n FROM products ${filter}`).get(...args) as {
        n: number;
      }
    ).n;
    records = (
      db
        .prepare(
          `SELECT id,data FROM products ${filter} ORDER BY name LIMIT ? OFFSET ?`,
        )
        .all(...args, size, (page - 1) * size) as { id: string; data: string }[]
    ).map((r) => ({ id: r.id, value: JSON.parse(r.data) }));
  } else if (type === "settings") {
    total = 1;
    records = [{ id: "site", value: source(type, "site") }];
  } else {
    const rows = (
      db
        .prepare(
          "SELECT id,data FROM entities WHERE type=? ORDER BY order_no,id",
        )
        .all(type) as { id: string; data: string }[]
    ).filter((r) => !q || r.data.toLowerCase().includes(q.toLowerCase()));
    total = rows.length;
    records = rows
      .slice((page - 1) * size, page * size)
      .map((r) => ({ id: r.id, value: JSON.parse(r.data) }));
  }
  return jsonLocalized(
    req,
    {
      dictionary: getDictionary(
        type === "product"
          ? { products: records.map((r) => r.id) }
          : type === "article"
            ? { articles: records.map((r) => r.id) }
            : {},
      ),
      records: records.map((r) => {
        const fields = contentFields(r.value),
          translation = readTranslation(type, r.id);
        const translated = Object.entries(fields).filter(
          ([k, v]) => translation[k]?.text && translation[k].source === v,
        ).length;
        return {
          id: r.id,
          name: r.value.name || r.value.title || "KONVEX",
          model: r.value.model || "",
          fields: Object.keys(fields).length,
          translated,
        };
      }),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / size)),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  if (!rateLimit(req, "translation", 60, 60000))
    return jsonLocalized(
      req,
      { error: "کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  try {
    const body = await readJsonBody(req, 1200000);
    if (
      !body ||
      !types.includes(body.type) ||
      typeof body.id !== "string" ||
      !body.fields ||
      typeof body.fields !== "object"
    )
      return jsonLocalized(
        req,
        { error: "درخواست نامعتبر است." },
        { status: 422 },
      );
    const record = source(body.type, body.id);
    if (!record)
      return jsonLocalized(req, { error: "محتوا پیدا نشد." }, { status: 404 });
    const original = contentFields(record);
    const fields: TranslationFields = {};
    for (const [key, value] of Object.entries(body.fields)) {
      if (
        !(key in original) ||
        typeof value !== "string" ||
        value.length > 30000
      )
        return jsonLocalized(
          req,
          { error: "فیلدهای ترجمه معتبر نیستند." },
          { status: 422 },
        );
      fields[key] = {
        source: original[key],
        text: value
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
          .trim(),
      };
    }
    getDB().transaction(() => {
      saveTranslation(body.type, body.id, fields);
      if (body.type === "product") reindexTranslatedProduct(body.id);
      if (body.type === "category") {
        const ids = categoryIds(body.id);
        const rows = getDB()
          .prepare(
            `SELECT id FROM products WHERE category_id IN (${ids.map(() => "?").join(",")})`,
          )
          .all(...ids) as { id: string }[];
        rows.forEach((p) => reindexTranslatedProduct(p.id));
      }
    })();
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "ذخیره ترجمه انجام نشد." },
      { status: 500 },
    );
  }
}
