"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  ChevronUp,
  LoaderCircle,
  Check,
} from "lucide-react";
import type { Product, Category, Brand, Application } from "@/lib/types";
import { Modal } from "../modal";
import { TextField, SelectField, CheckboxField, ImageUpload } from "./fields";
import { ProductImage } from "../ui";
import { apiRequest } from "@/lib/client-api";
export function newProduct(category: Category, brand: Brand): Product {
  const id = crypto.randomUUID(),
    now = new Date().toISOString();
  return {
    id,
    sku: "KV-" + Date.now().toString(36).toUpperCase(),
    slug: "konvex-product-" + Date.now().toString(36),
    brandId: brand.id,
    brand: brand.english,
    categoryId: category.id,
    subcategory: "",
    name: "",
    model: "",
    shortDescription: "",
    longDescription: "",
    specifications: category.filters.map((f, i) => ({
      key: f.key,
      label: f.label,
      value: "",
      highlight: i < 3,
    })),
    applications: [],
    features: [],
    images: [{ url: category.image, alt: "تصویر مرجع خانواده محصول" }],
    videos: [],
    documents: [],
    manuals: [],
    warranty: "شرایط ضمانت نیازمند تأیید است.",
    availability: "inquiry",
    price: null,
    discount: 0,
    tags: [category.name],
    relatedProductIds: [],
    compatibleProductIds: [],
    accessoryIds: [],
    included: [],
    faq: [],
    featured: false,
    isNew: true,
    popularityRank: 0,
    isSample: true,
    seoTitle: "",
    seoDescription: "",
    createdAt: now,
    updatedAt: now,
  };
}
export function ProductEditor({
  product,
  categories,
  brands,
  applications,
  onClose,
  onSaved,
}: {
  product: Product;
  categories: Category[];
  brands: Brand[];
  applications: Application[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [p, setP] = useState<Product>(structuredClone(product)),
    [tab, setTab] = useState(0),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const patch = (value: Partial<Product>) =>
    setP((prev) => ({ ...prev, ...value }));
  const tabs = [
    tr("اطلاعات پایه"),
    tr("مشخصات و کاربرد"),
    tr("تصاویر و محتوا"),
    tr("فروش و سئو"),
  ];
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const brand = brands.find((b) => b.id === p.brandId),
        category = categories.find((c) => c.id === p.categoryId);
      await apiRequest("/api/admin/products", {
        ...p,
        brand: brand?.english || p.brand,
        features: p.features.filter((v) => v.trim()),
        included: p.included.filter((v) => v.trim()),
        relatedProductIds: p.relatedProductIds.filter(Boolean),
        compatibleProductIds: p.compatibleProductIds.filter(Boolean),
        accessoryIds: p.accessoryIds.filter(Boolean),
        tags: [
          ...new Set([
            ...p.tags.filter((v) => v.trim()),
            category?.name || "",
            p.brand,
          ]),
        ],
        specifications: p.specifications.filter((s) => s.value.trim()),
        seoTitle:
          p.seoTitle ||
          tr("{v0} {v1} | کانوکس", { v0: tr(p.name), v1: tr(p.model) }),
        seoDescription: p.seoDescription || p.shortDescription,
      });
      onSaved();
    } catch (e) {
      const err = e as Error & {
        details?: string;
      };
      setError(err.message + (err.details ? " " + err.details : ""));
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={tr(
        product.name
          ? tr("ویرایش {v0}", { v0: tr(product.model) })
          : tr("افزودن محصول"),
      )}
      className="admin-editor-modal"
    >
      <form
        method="post"
        action={localizedPath("/api/admin/products")}
        onSubmit={save}
        noValidate
      >
        {locale === "en" && (
          <p className="source-content-notice">
            {tr(
              "اطلاعات منبع فارسی را ویرایش می‌کنید. ترجمه انگلیسی به‌صورت مستقل نگهداری می‌شود.",
            )}
          </p>
        )}
        <div
          className="admin-editor-tabs"
          role="tablist"
          aria-label={tr("بخش‌های ویرایش محصول")}
        >
          {tabs.map((t, i) => (
            <button
              type="button"
              key={t}
              role="tab"
              aria-selected={tab === i}
              className={tab === i ? "active" : ""}
              onClick={() => setTab(i)}
            >
              {tr(t)}
            </button>
          ))}
        </div>
        <div className="admin-editor-body">
          {tab === 0 && (
            <>
              <TextField
                label={tr("نام محصول")}
                value={p.name}
                onChange={(name) => patch({ name })}
                required
              />
              <div className="form-grid">
                <TextField
                  label={tr("مدل")}
                  value={p.model}
                  onChange={(model) => patch({ model })}
                  dir="ltr"
                  required
                />
                <TextField
                  label={tr("کد کالا (SKU)")}
                  value={p.sku}
                  onChange={(sku) => patch({ sku })}
                  dir="ltr"
                  required
                />
              </div>
              <TextField
                label={tr("آدرس مستقل محصول")}
                value={p.slug}
                onChange={(slug) => patch({ slug })}
                dir="ltr"
                required
                hint={tr(
                  "حروف کوچک انگلیسی، اعداد و خط تیره؛ مانند konvex-lm-60",
                )}
              />
              <div className="form-grid">
                <SelectField
                  label={tr("دسته‌بندی")}
                  value={p.categoryId}
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  onChange={(categoryId) => {
                    const c = categories.find((v) => v.id === categoryId)!;
                    patch({
                      categoryId,
                      specifications: c.filters.map((f, i) => ({
                        key: f.key,
                        label: f.label,
                        value:
                          p.specifications.find((s) => s.key === f.key)
                            ?.value || "",
                        highlight: i < 3,
                      })),
                    });
                  }}
                />
                <SelectField
                  label={tr("برند")}
                  value={p.brandId}
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                  onChange={(brandId) => patch({ brandId })}
                />
              </div>
              <TextField
                label={tr("زیردسته")}
                value={p.subcategory}
                onChange={(subcategory) => patch({ subcategory })}
              />
              <TextField
                label={tr("توضیح کوتاه")}
                value={p.shortDescription}
                onChange={(shortDescription) => patch({ shortDescription })}
                multiline
              />
              <TextField
                label={tr("معرفی کامل")}
                value={p.longDescription}
                onChange={(longDescription) => patch({ longDescription })}
                multiline
              />
            </>
          )}
          {tab === 1 && (
            <>
              <div className="admin-help">
                {tr(
                  "کلید فنی به فیلتر همان دسته متصل است. برای هر مقدار، واحد را هم بنویسید؛ مثلاً ",
                )}
                <bdi>60 m</bdi>
                {tr(". سه ویژگی مهم را برجسته کنید.")}
              </div>
              <div className="spec-editor">
                {p.specifications.map((s, i) => (
                  <div key={i} className="spec-editor-row">
                    <TextField
                      label={tr("کلید")}
                      value={s.key}
                      dir="ltr"
                      onChange={(key) =>
                        patch({
                          specifications: p.specifications.map((v, j) =>
                            j === i ? { ...v, key } : v,
                          ),
                        })
                      }
                    />
                    <TextField
                      label={tr("عنوان فارسی")}
                      value={s.label}
                      onChange={(label) =>
                        patch({
                          specifications: p.specifications.map((v, j) =>
                            j === i ? { ...v, label } : v,
                          ),
                        })
                      }
                    />
                    <TextField
                      label={tr("مقدار و واحد")}
                      value={s.value}
                      onChange={(value) =>
                        patch({
                          specifications: p.specifications.map((v, j) =>
                            j === i ? { ...v, value } : v,
                          ),
                        })
                      }
                    />
                    <CheckboxField
                      label={tr("برجسته")}
                      checked={!!s.highlight}
                      onChange={(highlight) =>
                        patch({
                          specifications: p.specifications.map((v, j) =>
                            j === i ? { ...v, highlight } : v,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={tr("حذف ویژگی {v0}", { v0: tr(s.label) })}
                      onClick={() =>
                        patch({
                          specifications: p.specifications.filter(
                            (_, j) => j !== i,
                          ),
                        })
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary small"
                onClick={() =>
                  patch({
                    specifications: [
                      ...p.specifications,
                      {
                        key: `attribute${p.specifications.length + 1}`,
                        label: "",
                        value: "",
                        highlight: false,
                      },
                    ],
                  })
                }
              >
                <Plus size={16} />
                {tr("ویژگی جدید")}
              </button>
              <h3 className="admin-subheading">{tr("کاربردها")}</h3>
              <div className="admin-checkbox-grid">
                {applications.map((a) => (
                  <CheckboxField
                    key={a.id}
                    label={tr(a.name)}
                    checked={p.applications.includes(a.id)}
                    onChange={(checked) =>
                      patch({
                        applications: checked
                          ? [...p.applications, a.id]
                          : p.applications.filter((id) => id !== a.id),
                      })
                    }
                  />
                ))}
              </div>
              <TextField
                label={tr("ویژگی‌های کلیدی — هر مورد یک خط")}
                value={p.features.join("\n")}
                onChange={(v) => patch({ features: v.split("\n") })}
                multiline
              />
              <TextField
                label={tr("اقلام همراه — هر مورد یک خط")}
                value={p.included.join("\n")}
                onChange={(v) => patch({ included: v.split("\n") })}
                multiline
              />
              <TextField
                label={tr("شناسه محصولات مشابه")}
                value={p.relatedProductIds.join(", ")}
                dir="ltr"
                hint={tr(
                  "شناسه‌ها را با کامای انگلیسی جدا کنید. خالی باشد: پیشنهاد خودکار از همان دسته.",
                )}
                onChange={(v) =>
                  patch({
                    relatedProductIds: v.split(",").map((v) => v.trim()),
                  })
                }
              />
              <TextField
                label={tr("شناسه متعلقات")}
                value={p.accessoryIds.join(", ")}
                dir="ltr"
                onChange={(v) =>
                  patch({ accessoryIds: v.split(",").map((v) => v.trim()) })
                }
              />
              <TextField
                label={tr("شناسه محصولات سازگار")}
                value={p.compatibleProductIds.join(", ")}
                dir="ltr"
                onChange={(v) =>
                  patch({
                    compatibleProductIds: v.split(",").map((v) => v.trim()),
                  })
                }
              />
              <p className="form-hint">
                {tr("شناسه همین محصول: ")}
                <bdi>{tr(p.id)}</bdi>
              </p>
            </>
          )}
          {tab === 2 && (
            <>
              <ImageUpload
                onUpload={(url) =>
                  patch({
                    images: [
                      { url, alt: p.name || tr("تصویر محصول") },
                      ...p.images,
                    ].slice(0, 10),
                  })
                }
              />
              <div className="admin-images">
                {p.images.map((im, i) => (
                  <div className="admin-image-row" key={i}>
                    <ProductImage src={im.url} alt={tr(im.alt)} sizes="90px" />
                    <div>
                      <TextField
                        label={tr(
                          i === 0 ? tr("تصویر اصلی — آدرس") : tr("آدرس تصویر"),
                        )}
                        value={im.url}
                        dir="ltr"
                        onChange={(url) =>
                          patch({
                            images: p.images.map((v, j) =>
                              j === i ? { ...v, url } : v,
                            ),
                          })
                        }
                      />
                      <TextField
                        label={tr("توضیح تصویر (Alt)")}
                        value={im.alt}
                        onChange={(alt) =>
                          patch({
                            images: p.images.map((v, j) =>
                              j === i ? { ...v, alt } : v,
                            ),
                          })
                        }
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={tr("انتخاب به‌عنوان تصویر اصلی")}
                        disabled={i === 0}
                        onClick={() =>
                          patch({
                            images: [im, ...p.images.filter((_, j) => j !== i)],
                          })
                        }
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={tr("حذف تصویر {v0}", { v0: i + 1 })}
                        disabled={p.images.length === 1}
                        onClick={() =>
                          patch({ images: p.images.filter((_, j) => j !== i) })
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary small"
                disabled={p.images.length >= 10}
                onClick={() =>
                  patch({
                    images: [
                      ...p.images,
                      { url: "/images/hero.webp", alt: "" },
                    ],
                  })
                }
              >
                <Plus size={16} />
                {tr("افزودن تصویر از فایل موجود")}
              </button>
              <h3 className="admin-subheading">{tr("پرسش‌های متداول")}</h3>
              {p.faq.map((f, i) => (
                <div className="faq-editor-row" key={i}>
                  <TextField
                    label={tr("پرسش")}
                    value={f.question}
                    onChange={(question) =>
                      patch({
                        faq: p.faq.map((v, j) =>
                          j === i ? { ...v, question } : v,
                        ),
                      })
                    }
                  />
                  <TextField
                    label={tr("پاسخ")}
                    value={f.answer}
                    multiline
                    onChange={(answer) =>
                      patch({
                        faq: p.faq.map((v, j) =>
                          j === i ? { ...v, answer } : v,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="text-link danger-text"
                    onClick={() =>
                      patch({ faq: p.faq.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 size={16} />
                    {tr("حذف پرسش")}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button secondary small"
                onClick={() =>
                  patch({ faq: [...p.faq, { question: "", answer: "" }] })
                }
              >
                <Plus size={16} />
                {tr("پرسش جدید")}
              </button>
            </>
          )}
          {tab === 3 && (
            <>
              <div className="admin-checkbox-grid">
                <CheckboxField
                  label={tr("محصول منتخب")}
                  checked={p.featured}
                  onChange={(featured) => patch({ featured })}
                />
                <CheckboxField
                  label={tr("محصول جدید")}
                  checked={p.isNew}
                  onChange={(isNew) => patch({ isNew })}
                />
                <CheckboxField
                  label={tr("اطلاعات و تصاویر نمونه‌اند")}
                  checked={p.isSample}
                  onChange={(isSample) => patch({ isSample })}
                />
              </div>
              <div className="form-grid">
                <SelectField
                  label={tr("وضعیت موجودی")}
                  value={p.availability}
                  onChange={(availability) =>
                    patch({
                      availability: availability as Product["availability"],
                    })
                  }
                  options={[
                    { value: "inquiry", label: tr("نیازمند استعلام") },
                    { value: "in_stock", label: tr("موجود") },
                    { value: "unavailable", label: tr("ناموجود") },
                  ]}
                />
                <TextField
                  label={tr("قیمت — تومان")}
                  type="number"
                  value={p.price ?? ""}
                  onChange={(v) =>
                    patch({ price: v === "" ? null : Number(v) })
                  }
                  hint={tr("خالی بماند: قیمت با استعلام")}
                />
              </div>
              <div className="form-grid">
                <TextField
                  label={tr("تخفیف — درصد")}
                  type="number"
                  value={p.discount}
                  onChange={(v) => patch({ discount: Number(v) })}
                />
                <TextField
                  label={tr("رتبه نمایش در پرطرفدارها")}
                  type="number"
                  value={p.popularityRank}
                  onChange={(v) => patch({ popularityRank: Number(v) })}
                  hint={tr(
                    "این رتبه آماری نیست؛ مقدار ۷ به بالا در این مجموعه نمایش داده می‌شود.",
                  )}
                />
              </div>
              <TextField
                label={tr("شرایط ضمانت")}
                value={p.warranty}
                onChange={(warranty) => patch({ warranty })}
                multiline
              />
              <TextField
                label={tr("برچسب‌ها — با ویرگول جدا کنید")}
                value={p.tags.join(tr("، "))}
                onChange={(v) =>
                  patch({ tags: v.split(/[،,]/).map((v) => v.trim()) })
                }
              />
              <TextField
                label={tr("عنوان سئو")}
                value={p.seoTitle}
                onChange={(seoTitle) => patch({ seoTitle })}
              />
              <TextField
                label={tr("توضیح سئو")}
                value={p.seoDescription}
                onChange={(seoDescription) => patch({ seoDescription })}
                multiline
              />
              <div className="admin-help">
                {tr(
                  "تا زمانی که مشخصات محصول تأیید نشده‌اند، علامت نمونه را حفظ کنید. حالت ایندکس سایت از تنظیمات استقرار کنترل می‌شود.",
                )}
              </div>
            </>
          )}
          {error && (
            <div className="form-error" role="alert">
              {tr(error)}
            </div>
          )}
        </div>
        <div className="admin-editor-footer">
          <button className="button primary" disabled={saving}>
            {saving ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Save size={17} />
            )}{" "}
            {tr(saving ? tr("در حال ذخیره…") : tr("ذخیره محصول"))}
          </button>
          <button type="button" className="button secondary" onClick={onClose}>
            {tr("انصراف")}
          </button>
          <span>{tr("تغییرات مستقیماً در کاتالوگ اعمال می‌شوند.")}</span>
        </div>
      </form>
    </Modal>
  );
}
