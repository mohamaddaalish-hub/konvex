import { jsonLocalized } from "@/lib/api-i18n";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { settingsSchema } from "@/lib/validation";
import { getDB } from "@/lib/db";
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  try {
    const result = settingsSchema.safeParse(await readJsonBody(req, 32000));
    if (!result.success)
      return jsonLocalized(
        req,
        {
          error: "تنظیمات را بررسی کنید.",
          details: result.error.issues
            .map((i) => i.path.join(".") + ": " + i.message)
            .join(" / "),
        },
        { status: 422 },
      );
    getDB()
      .prepare("UPDATE settings SET data=? WHERE id=1")
      .run(JSON.stringify(result.data));
    return jsonLocalized(req, { ok: true });
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "ذخیره تنظیمات انجام نشد." },
      { status: 500 },
    );
  }
}
