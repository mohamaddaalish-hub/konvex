import { z } from "zod";
import { normalizeDigits, cleanText } from "./format";
const text = (max: number) => z.string().max(max).transform(cleanText);
export const quoteSchema = z
  .object({
    name: text(100).pipe(z.string().min(2, "نام را کامل وارد کنید.")),
    phone: z
      .string()
      .transform((v) => normalizeDigits(v).replace(/[\s()-]/g, ""))
      .pipe(
        z
          .string()
          .regex(
            /^(?:09\d{9}|\+\d{10,15}|00\d{10,15})$/,
            "شماره تماس معتبر وارد کنید؛ مانند ۰۹۱۲۱۲۳۴۵۶۷.",
          ),
      ),
    email: z
      .union([z.literal(""), z.email("ایمیل معتبر وارد کنید.")])
      .default(""),
    items: z
      .array(
        z.object({
          productId: z.string().min(1).max(100),
          quantity: z.number().int().min(1).max(100000),
        }),
      )
      .max(10)
      .default([]),
    notes: text(2000).default(""),
    preferredContact: z.enum(["phone", "whatsapp", "email"]),
    purpose: z.enum(["quote", "consultation"]),
    consent: z.literal(true, {
      error: "پذیرش حریم خصوصی برای ثبت درخواست لازم است.",
    }),
    website: z.string().max(0, "درخواست نامعتبر است.").optional(),
    idempotencyKey: z.string().uuid(),
  })
  .superRefine((v, c) => {
    if (v.purpose === "quote" && !v.items.length)
      c.addIssue({
        code: "custom",
        path: ["items"],
        message: "حداقل یک محصول انتخاب کنید یا درخواست مشاوره را فعال کنید.",
      });
    if (v.preferredContact === "email" && !v.email)
      c.addIssue({
        code: "custom",
        path: ["email"],
        message: "برای پاسخ ایمیلی، ایمیل را وارد کنید.",
      });
  });
const slug = z
  .string()
  .min(2)
  .max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
const asset = z
  .string()
  .max(500)
  .regex(/^\/(?:images|uploads)\/[a-zA-Z0-9_.-]+\.(?:webp|jpg|jpeg|png)$/);
const document = z.object({
  name: text(150),
  url: z
    .string()
    .max(500)
    .regex(/^\/(?:downloads|uploads)\/[a-zA-Z0-9_.-]+\.(?:pdf|html)$/),
  type: text(30),
});
export const productSchema = z
  .object({
    id,
    sku: z.string().min(2).max(80),
    slug,
    brandId: id,
    brand: text(60),
    categoryId: id,
    subcategory: text(100).default(""),
    name: text(200).pipe(z.string().min(3)),
    model: text(80).pipe(z.string().min(2)),
    shortDescription: text(500),
    longDescription: text(10000),
    specifications: z
      .array(
        z.object({
          key: z
            .string()
            .max(60)
            .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
          label: text(100),
          value: text(200),
          unit: text(20).optional(),
          highlight: z.boolean().optional(),
        }),
      )
      .max(60),
    applications: z.array(id).max(20),
    features: z.array(text(500)).max(30),
    images: z
      .array(z.object({ url: asset, alt: text(200) }))
      .min(1)
      .max(10),
    videos: z
      .array(
        z
          .string()
          .max(500)
          .regex(/^\/uploads\/[a-zA-Z0-9_.-]+\.mp4$/),
      )
      .max(5),
    documents: z.array(document).max(20),
    manuals: z.array(document).max(20),
    warranty: text(3000),
    availability: z.enum(["inquiry", "in_stock", "unavailable"]),
    price: z.number().nonnegative().max(1e12).nullable(),
    discount: z.number().min(0).max(100),
    tags: z.array(text(100)).max(50),
    relatedProductIds: z.array(id).max(30),
    compatibleProductIds: z.array(id).max(30),
    accessoryIds: z.array(id).max(30),
    included: z.array(text(300)).max(30),
    faq: z.array(z.object({ question: text(300), answer: text(2000) })).max(20),
    featured: z.boolean(),
    isNew: z.boolean(),
    popularityRank: z.number().int().min(0).max(100000),
    isSample: z.boolean(),
    seoTitle: text(200),
    seoDescription: text(500),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .superRefine((v, c) => {
    if (
      new Set(v.specifications.map((s) => s.key)).size !==
      v.specifications.length
    )
      c.addIssue({
        code: "custom",
        path: ["specifications"],
        message: "کلید ویژگی‌های فنی باید یکتا باشد.",
      });
  });
export const categorySchema = z
  .object({
    id,
    slug,
    name: text(100).pipe(z.string().min(2)),
    english: text(100),
    description: text(1000),
    image: asset,
    filters: z
      .array(
        z.object({
          key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
          label: text(100),
          numeric: z.boolean().optional(),
        }),
      )
      .max(30),
    parentId: z.string().max(100).optional(),
    order: z.number().int().min(0).max(10000),
    count: z.number().optional(),
  })
  .superRefine((v, c) => {
    if (
      new Set(v.filters.map((f) => f.key)).size !== v.filters.length ||
      v.filters.some((f) => ["brand", "application"].includes(f.key))
    )
      c.addIssue({
        code: "custom",
        path: ["filters"],
        message: "کلید فیلترها باید یکتا و متفاوت از brand و application باشد.",
      });
  });
export const brandSchema = z.object({
  id,
  name: text(100).pipe(z.string().min(2)),
  english: text(100),
  description: text(2000),
  logo: z.union([z.literal(""), asset]),
});
export const articleSchema = z.object({
  id,
  slug,
  title: text(200).pipe(z.string().min(3)),
  excerpt: text(500),
  image: asset,
  category: text(100),
  readTime: z.number().int().min(1).max(180),
  sections: z
    .array(z.object({ title: text(200), body: text(20000) }))
    .min(1)
    .max(30),
  relatedCategory: id,
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  seoTitle: text(200),
  seoDescription: text(500),
});
const url = z.union([
  z.literal(""),
  z
    .url()
    .refine((v) => v.startsWith("https://"), "لینک باید با https شروع شود."),
]);
export const settingsSchema = z.object({
  name: text(100),
  englishName: text(100),
  tagline: text(200),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s()-]*$/),
  whatsapp: z
    .string()
    .max(30)
    .regex(/^[+\d\s()-]*$/),
  email: z.union([z.literal(""), z.email()]),
  address: text(500),
  hours: text(200),
  mapUrl: url,
  instagram: url,
  linkedin: url,
  sampleMode: z.boolean(),
});
