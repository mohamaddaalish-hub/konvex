import { jsonLocalized } from "@/lib/api-i18n";
import { NextRequest, NextResponse } from "next/server";
import { makeCsrf, secureCookie } from "@/lib/security";
export async function GET(req: NextRequest) {
  try {
    const token = makeCsrf();
    const response = jsonLocalized(
      req,
      { token },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set("kv-csrf", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie(req),
      path: "/",
      maxAge: 3600,
    });
    return response;
  } catch {
    return jsonLocalized(
      req,
      { error: "تنظیمات امنیتی سرور کامل نیست." },
      { status: 503 },
    );
  }
}
