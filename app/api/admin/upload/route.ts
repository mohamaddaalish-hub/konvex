import { jsonLocalized } from "@/lib/api-i18n";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, rateLimit } from "@/lib/security";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return jsonLocalized(req, { error: "دسترسی مجاز نیست." }, { status: 403 });
  if (!rateLimit(req, "upload", 30, 600000))
    return jsonLocalized(
      req,
      { error: "تعداد بارگذاری‌ها زیاد است." },
      { status: 429 },
    );
  if (Number(req.headers.get("content-length") || 0) > 6 * 1024 * 1024)
    return jsonLocalized(
      req,
      { error: "حداکثر اندازه تصویر ۵ مگابایت است." },
      { status: 413 },
    );
  try {
    const data = await req.formData(),
      file = data.get("file");
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return jsonLocalized(
        req,
        { error: "تصویر JPG، PNG یا WebP تا ۵ مگابایت انتخاب کنید." },
        { status: 422 },
      );
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await sharp(buffer, { limitInputPixels: 40000000 })
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    const name = randomUUID() + ".webp";
    await fs.mkdir(path.join(process.cwd(), "data/uploads"), {
      recursive: true,
    });
    await fs.writeFile(path.join(process.cwd(), "data/uploads", name), result);
    return jsonLocalized(req, { url: "/uploads/" + name });
  } catch {
    return jsonLocalized(
      req,
      { error: "فایل تصویر قابل پردازش نیست." },
      { status: 422 },
    );
  }
}
