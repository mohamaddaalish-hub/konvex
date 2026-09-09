"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useState } from "react";
import { Save, Plus, Trash2, LoaderCircle } from "lucide-react";
import type { Category, Brand, Article } from "@/lib/types";
import { Modal } from "../modal";
import { TextField, SelectField, CheckboxField, ImageUpload } from "./fields";
import { apiRequest } from "@/lib/client-api";
type Entity = Category | Brand | Article;
export function newEntity(type: string, categories: Category[]): Entity {
  const id = crypto.randomUUID(),
    slug = "konvex-" + Date.now().toString(36);
  if (type === "category")
    return {
      id,
      slug,
      name: "",
      english: "",
      description: "",
      image: "/images/hero.webp",
      order: categories.length + 1,
      filters: [],
    };
  if (type === "brand")
    return { id, name: "", english: "", description: "", logo: "" };
  return {
    id,
    slug,
    title: "",
    excerpt: "",
    image: "/images/measurement.webp",
    category: "راهنمای انتخاب",
    readTime: 5,
    sections: [{ title: "", body: "" }],
    relatedCategory: categories[0]?.id || "",
    publishedAt: new Date().toISOString().slice(0, 10),
    seoTitle: "",
    seoDescription: "",
  };
}
export function EntityEditor({
  type,
  entity,
  categories,
  onSaved,
  onClose,
}: {
  type: "category" | "brand" | "article";
  entity: Entity;
  categories: Category[];
  onSaved: () => void;
  onClose: () => void;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [data, setData] = useState<any>(structuredClone(entity)),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const patch = (v: Record<string, unknown>) =>
    setData((p: Record<string, unknown>) => ({ ...p, ...v }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/admin/entities", { type, data });
      onSaved();
    } catch (e) {
      const err = e as Error & {
        details?: string;
      };
      setError(err.message + (err.details ? " " + err.details : ""));
    } finally {
      setBusy(false);
    }
  }
  const titles = {
    category: tr("دسته‌بندی"),
    brand: tr("برند"),
    article: tr("مقاله"),
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={tr("ویرایش {v0}", { v0: tr(titles[type]) })}
      className="admin-editor-modal"
    >
      <form
        method="post"
        action={localizedPath("/api/admin/entities")}
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
        <div className="admin-editor-body">
          <TextField
            label={tr(type === "article" ? tr("عنوان مقاله") : tr("نام"))}
            value={type === "article" ? data.title : data.name}
            onChange={(v) =>
              patch(type === "article" ? { title: v } : { name: v })
            }
            required
          />
          {type !== "brand" && (
            <TextField
              label={tr("آدرس مستقل")}
              value={data.slug}
              dir="ltr"
              required
              onChange={(slug) => patch({ slug })}
              hint={tr("حروف کوچک انگلیسی، عدد و خط تیره؛ بدون فاصله")}
            />
          )}
          {type === "category" && (
            <>
              <div className="form-grid">
                <TextField
                  label={tr("عنوان لاتین گروه")}
                  value={data.english}
                  dir="ltr"
                  onChange={(english) => patch({ english })}
                />
                <TextField
                  label={tr("ترتیب نمایش")}
                  value={data.order}
                  type="number"
                  onChange={(v) => patch({ order: Number(v) })}
                />
              </div>
              <TextField
                label={tr("توضیح دسته")}
                value={data.description}
                onChange={(description) => patch({ description })}
                multiline
              />
              <SelectField
                label={tr("دسته والد")}
                value={data.parentId || ""}
                options={[
                  { value: "", label: tr("دسته اصلی") },
                  ...categories
                    .filter((c) => c.id !== data.id)
                    .map((c) => ({ value: c.id, label: c.name })),
                ]}
                onChange={(parentId) => patch({ parentId })}
              />
              <ImageUpload onUpload={(image) => patch({ image })} />
              <TextField
                label={tr("آدرس تصویر")}
                value={data.image}
                dir="ltr"
                onChange={(image) => patch({ image })}
              />
              <h3 className="admin-subheading">
                {tr("فیلترهای اختصاصی این دسته")}
              </h3>
              <p className="admin-help">
                {tr(
                  "کلید فیلتر باید با کلید همان ویژگی در محصولات یکسان باشد؛ مثال: range برای برد. افزودن این فیلتر نیازی به تغییر کد سایت ندارد.",
                )}
              </p>
              {data.filters.map(
                (
                  f: {
                    key: string;
                    label: string;
                    numeric?: boolean;
                  },
                  i: number,
                ) => (
                  <div className="entity-filter-row" key={i}>
                    <TextField
                      label={tr("کلید")}
                      value={f.key}
                      dir="ltr"
                      onChange={(key) =>
                        patch({
                          filters: data.filters.map((v: unknown, j: number) =>
                            j === i ? { ...f, key } : v,
                          ),
                        })
                      }
                    />
                    <TextField
                      label={tr("عنوان فارسی")}
                      value={f.label}
                      onChange={(label) =>
                        patch({
                          filters: data.filters.map((v: unknown, j: number) =>
                            j === i ? { ...f, label } : v,
                          ),
                        })
                      }
                    />
                    <CheckboxField
                      label={tr("عدد")}
                      checked={!!f.numeric}
                      onChange={(numeric) =>
                        patch({
                          filters: data.filters.map((v: unknown, j: number) =>
                            j === i ? { ...f, numeric } : v,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={tr("حذف فیلتر")}
                      onClick={() =>
                        patch({
                          filters: data.filters.filter(
                            (_: unknown, j: number) => j !== i,
                          ),
                        })
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ),
              )}
              <button
                className="button secondary small"
                type="button"
                onClick={() =>
                  patch({
                    filters: [
                      ...data.filters,
                      {
                        key: "attribute" + (data.filters.length + 1),
                        label: "",
                        numeric: false,
                      },
                    ],
                  })
                }
              >
                <Plus size={16} />
                {tr("فیلتر جدید")}
              </button>
            </>
          )}
          {type === "brand" && (
            <>
              <TextField
                label={tr("نام لاتین")}
                value={data.english}
                dir="ltr"
                onChange={(english) => patch({ english })}
              />
              <TextField
                label={tr("معرفی برند")}
                value={data.description}
                multiline
                onChange={(description) => patch({ description })}
              />
              <ImageUpload
                label={tr("بارگذاری لوگو")}
                onUpload={(logo) => patch({ logo })}
              />
              <TextField
                label={tr("آدرس لوگو — اختیاری")}
                value={data.logo}
                dir="ltr"
                onChange={(logo) => patch({ logo })}
              />
            </>
          )}
          {type === "article" && (
            <>
              <TextField
                label={tr("خلاصه مقاله")}
                value={data.excerpt}
                multiline
                onChange={(excerpt) => patch({ excerpt })}
              />
              <div className="form-grid">
                <TextField
                  label={tr("گروه محتوایی")}
                  value={data.category}
                  onChange={(category) => patch({ category })}
                />
                <SelectField
                  label={tr("دسته محصول مرتبط")}
                  value={data.relatedCategory}
                  onChange={(relatedCategory) => patch({ relatedCategory })}
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </div>
              <div className="form-grid">
                <TextField
                  label={tr("تاریخ انتشار")}
                  type="date"
                  value={data.publishedAt}
                  onChange={(publishedAt) => patch({ publishedAt })}
                />
                <TextField
                  label={tr("زمان مطالعه — دقیقه")}
                  type="number"
                  value={data.readTime}
                  onChange={(v) => patch({ readTime: Number(v) })}
                />
              </div>
              <ImageUpload onUpload={(image) => patch({ image })} />
              <TextField
                label={tr("آدرس تصویر")}
                value={data.image}
                dir="ltr"
                onChange={(image) => patch({ image })}
              />
              <h3 className="admin-subheading">{tr("بخش‌های مقاله")}</h3>
              {data.sections.map(
                (
                  s: {
                    title: string;
                    body: string;
                  },
                  i: number,
                ) => (
                  <div key={i} className="faq-editor-row">
                    <TextField
                      label={tr("عنوان بخش")}
                      value={s.title}
                      onChange={(title) =>
                        patch({
                          sections: data.sections.map(
                            (v: unknown, j: number) =>
                              j === i ? { ...s, title } : v,
                          ),
                        })
                      }
                    />
                    <TextField
                      label={tr("متن بخش")}
                      value={s.body}
                      multiline
                      onChange={(body) =>
                        patch({
                          sections: data.sections.map(
                            (v: unknown, j: number) =>
                              j === i ? { ...s, body } : v,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="text-link danger-text"
                      disabled={data.sections.length === 1}
                      onClick={() =>
                        patch({
                          sections: data.sections.filter(
                            (_: unknown, j: number) => j !== i,
                          ),
                        })
                      }
                    >
                      <Trash2 size={16} />
                      {tr("حذف بخش")}
                    </button>
                  </div>
                ),
              )}
              <button
                type="button"
                className="button secondary small"
                onClick={() =>
                  patch({
                    sections: [...data.sections, { title: "", body: "" }],
                  })
                }
              >
                <Plus size={16} />
                {tr("بخش جدید")}
              </button>
              <TextField
                label={tr("عنوان سئو")}
                value={data.seoTitle}
                onChange={(seoTitle) => patch({ seoTitle })}
              />
              <TextField
                label={tr("توضیح سئو")}
                value={data.seoDescription}
                multiline
                onChange={(seoDescription) => patch({ seoDescription })}
              />
            </>
          )}
          {error && (
            <div className="form-error" role="alert">
              {tr(error)}
            </div>
          )}
        </div>
        <div className="admin-editor-footer">
          <button className="button primary" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Save size={17} />
            )}
            {tr("ذخیره ")}
            {tr(titles[type])}
          </button>
          <button className="button secondary" type="button" onClick={onClose}>
            {tr("انصراف")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
