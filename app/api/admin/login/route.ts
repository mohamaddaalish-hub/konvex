import { jsonLocalized } from "@/lib/api-i18n";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { NextRequest, NextResponse } from "next/server";
import {
  verifyCsrf,
  rateLimit,
  verifyPassword,
  createSession,
  secureCookie,
} from "@/lib/security";
export async function POST(req: NextRequest) {
  if (!verifyCsrf(req))
    return jsonLocalized(
      req,
      { error: "نشست نامعتبر است. صفحه را تازه کنید." },
      { status: 403 },
    );
  if (!rateLimit(req, "login", 5, 900000))
    return jsonLocalized(
      req,
      { error: "تلاش‌های ورود زیاد است. ۱۵ دقیقه بعد تلاش کنید." },
      { status: 429 },
    );
  if (!process.env.ADMIN_PASSWORD)
    return jsonLocalized(
      req,
      { error: "دسترسی مدیریت هنوز پیکربندی نشده است." },
      { status: 503 },
    );
  try {
    const { password } = await readJsonBody(req, 2048);
    if (typeof password !== "string" || !verifyPassword(password))
      return jsonLocalized(
        req,
        { error: "رمز ورود صحیح نیست." },
        { status: 401 },
      );
    const response = jsonLocalized(req, { ok: true });
    response.cookies.set("kv-admin", createSession(), {
      httpOnly: true,
      secure: secureCookie(req),
      sameSite: "lax",
      path: "/",
      maxAge: 28800,
    });
    return response;
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "امکان ورود وجود ندارد." },
      { status: 400 },
    );
  }
}
