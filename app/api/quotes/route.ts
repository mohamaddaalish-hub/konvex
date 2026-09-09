import { jsonLocalized } from "@/lib/api-i18n";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "node:crypto";
import { quoteSchema } from "@/lib/validation";
import { verifyCsrf, rateLimit } from "@/lib/security";
import { getProduct, getSettings } from "@/lib/catalog";
export async function POST(req: NextRequest) {
  if (!verifyCsrf(req))
    return jsonLocalized(
      req,
      { error: "نشست فرم معتبر نیست. صفحه را تازه کنید و دوباره تلاش کنید." },
      { status: 403 },
    );
  if (!rateLimit(req, "quote", 8, 600000))
    return jsonLocalized(
      req,
      { error: "تعداد درخواست‌ها زیاد است. ده دقیقه دیگر تلاش کنید." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  if (Number(req.headers.get("content-length") || 0) > 20000)
    return jsonLocalized(
      req,
      { error: "حجم درخواست بیش از حد مجاز است." },
      { status: 413 },
    );
  try {
    const body = await readJsonBody(req, 20000);
    const validation = quoteSchema.safeParse(body);
    if (!validation.success) {
      const fields: Record<string, string> = {};
      for (const i of validation.error.issues)
        fields[String(i.path[0])] = i.message;
      return jsonLocalized(
        req,
        { error: "اطلاعات فرم را بررسی کنید.", fields },
        { status: 422 },
      );
    }
    const data = validation.data;
    const store = globalThis as unknown as {
      konvexQuotes?: Map<string, { reference: string }>;
    };
    const quotes = store.konvexQuotes || (store.konvexQuotes = new Map());
    const previous = quotes.get(data.idempotencyKey);
    if (previous)
      return jsonLocalized(req, {
        reference: previous.reference,
        sample: getSettings().sampleMode,
      });
    const items = [];
    for (const item of data.items) {
      const p = getProduct(item.productId);
      if (!p)
        return jsonLocalized(
          req,
          {
            error:
              "یکی از محصولات دیگر در کاتالوگ وجود ندارد. انتخاب خود را بررسی کنید.",
          },
          { status: 422 },
        );
      items.push({ ...item, name: p.name, model: p.model });
    }
    const id = randomUUID(),
      date = new Date(),
      reference = `KV-${date.toISOString().slice(2, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const quote = {
      id,
      reference,
      name: data.name,
      phone: data.phone,
      email: data.email,
      items,
      notes: data.notes,
      preferredContact: data.preferredContact,
      purpose: data.purpose,
      status: "new",
      createdAt: date.toISOString(),
    };
    quotes.set(data.idempotencyKey, { reference });
    return jsonLocalized(
      req,
      { reference, sample: getSettings().sampleMode },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof RequestBodyError)
      return jsonLocalized(req, { error: e.message }, { status: e.status });
    return jsonLocalized(
      req,
      { error: "درخواست ثبت نشد. ارتباط با سرور را بررسی و دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
