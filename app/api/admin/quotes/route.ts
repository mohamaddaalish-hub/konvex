import { jsonLocalized } from "@/lib/api-i18n";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { getDB } from "@/lib/db";
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  try {
    const { id, status } = await readJsonBody(req, 4096);
    if (
      typeof id !== "string" ||
      !["new", "reviewing", "answered", "archived"].includes(status)
    )
      return jsonLocalized(
        req,
        { error: "وضعیت معتبر نیست." },
        { status: 422 },
      );
    getDB().prepare("UPDATE quotes SET status=? WHERE id=?").run(status, id);
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "ذخیره وضعیت انجام نشد." },
      { status: 500 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  try {
    const { id } = await readJsonBody(req, 4096);
    if (typeof id !== "string")
      return jsonLocalized(
        req,
        { error: "شناسه معتبر نیست." },
        { status: 422 },
      );
    getDB().prepare("DELETE FROM quotes WHERE id=?").run(id);
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "حذف درخواست انجام نشد." },
      { status: 500 },
    );
  }
}
