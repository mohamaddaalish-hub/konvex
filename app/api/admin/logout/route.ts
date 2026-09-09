import { jsonLocalized } from "@/lib/api-i18n";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  const response = jsonLocalized(req, { ok: true });
  response.cookies.delete("kv-admin");
  return response;
}
