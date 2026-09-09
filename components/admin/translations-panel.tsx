"use client";
import { usePreferences } from "../preferences";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useI18n } from "@/i18n/use-i18n";
import { apiRequest } from "@/lib/client-api";
import {
  Languages,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Save,
  Info,
} from "lucide-react";
import { Modal } from "../modal";
import { useStore } from "../store";
type Row = {
  id: string;
  name: string;
  model: string;
  fields: number;
  translated: number;
};
type Detail = {
  type: string;
  id: string;
  name: string;
  source: Record<string, string>;
  translation: Record<string, { source: string; text: string }>;
};
export function TranslationsPanel() {
  const { t, n, locale } = useI18n(),
    { mergeDictionary } = usePreferences(),
    router = useRouter(),
    { toast } = useStore();
  const [type, setType] = useState("product"),
    [page, setPage] = useState(1),
    [query, setQuery] = useState(""),
    [data, setData] = useState<{
      records: Row[];
      pages: number;
      total: number;
    }>({ records: [], pages: 1, total: 0 }),
    [detail, setDetail] = useState<Detail | null>(null),
    [fields, setFields] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch(
      `/api/admin/translations?type=${type}&page=${page}&q=${encodeURIComponent(query)}`,
      {
        signal: ctrl.signal,
        cache: "no-store",
        headers: { "x-konvex-locale": locale },
      },
    )
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        mergeDictionary(d.dictionary || {});
        setData(d);
        setError("");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [type, page, query, locale, version]);
  async function edit(id: string) {
    setError("");
    try {
      const r = await fetch(
        `/api/admin/translations?type=${type}&id=${encodeURIComponent(id)}`,
        { cache: "no-store", headers: { "x-konvex-locale": locale } },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      mergeDictionary(d.dictionary || {});
      setDetail(d);
      setFields(
        Object.fromEntries(
          Object.keys(d.source).map((k) => [k, d.translation[k]?.text || ""]),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!detail || busy) return;
    setBusy(true);
    try {
      await apiRequest("/api/admin/translations", {
        type: detail.type,
        id: detail.id,
        fields,
      });
      toast(t("ترجمه ذخیره شد؛ داده فارسی تغییری نکرد."));
      setDetail(null);
      setVersion((v) => v + 1);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const types = [
    ["product", "محصولات"],
    ["category", "دسته‌بندی‌ها"],
    ["brand", "برندها"],
    ["application", "کاربردها"],
    ["article", "دانشنامه"],
    ["settings", "تنظیمات سایت"],
  ];
  return (
    <section className="translations-panel">
      <div className="translation-intro">
        <Languages size={23} />
        <div>
          <h2>{t("دو زبان، یک کاتالوگ.")}</h2>
          <p>
            {t(
              "ترجمه‌ها جدا از اطلاعات فارسی ذخیره می‌شوند. شناسه‌ها، قیمت، اعداد فنی و روابط محصولات مشترک باقی می‌مانند.",
            )}
          </p>
        </div>
      </div>
      <div className="translation-toolbar">
        <label>
          <span>{t("نوع محتوا")}</span>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            {types.map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>
        </label>
        <label className="catalog-search">
          <Search size={18} />
          <input
            aria-label={t("جستجوی محتوای ترجمه")}
            placeholder={t("جستجوی نام، مدل یا کد کالا…")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {t(error)}
        </div>
      )}
      <div className="admin-table-scroll" aria-busy={loading}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("محتوا")}</th>
              <th>{t("نسخه انگلیسی")}</th>
              <th>{t("عملیات")}</th>
            </tr>
          </thead>
          <tbody>
            {data.records.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{t(row.name)}</strong>
                  <small className="translation-id" dir="ltr">
                    {row.model || row.id}
                  </small>
                </td>
                <td>
                  <span
                    className={`translation-status ${row.translated === row.fields ? "complete" : ""}`}
                  >
                    {row.translated === row.fields && <Check size={14} />}
                    <bdi>
                      {n(row.translated)} / {n(row.fields)}
                    </bdi>
                    <span>{t("فیلد")}</span>
                  </span>
                </td>
                <td>
                  <button
                    className="button secondary small"
                    onClick={() => edit(row.id)}
                  >
                    {t("ویرایش ترجمه")}
                    <Languages size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !data.records.length && (
          <p className="translation-empty">{t("محتوایی پیدا نشد.")}</p>
        )}
      </div>
      <nav className="admin-pagination" aria-label={t("صفحه‌بندی ترجمه‌ها")}>
        <button
          className="button secondary small"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {t("قبلی")}
        </button>
        <span>
          {t("صفحه")} {n(page)} / {n(data.pages)}
        </span>
        <button
          className="button secondary small"
          disabled={page >= data.pages}
          onClick={() => setPage((p) => p + 1)}
        >
          {t("بعدی")}
        </button>
      </nav>
      <Modal
        open={!!detail}
        onClose={() => {
          if (!busy) setDetail(null);
        }}
        title={t("ویرایش ترجمه انگلیسی")}
        className="translation-modal"
      >
        {detail && (
          <form method="post" action="/api/admin/translations" onSubmit={save}>
            <div className="translation-editor-heading">
              <strong>{t(detail.name)}</strong>
              <p>
                <Info size={16} />
                {t(
                  "متن منبع فقط برای مرجع است. ترجمه انگلیسی را در ستون روبه‌رو ویرایش کنید.",
                )}
              </p>
            </div>
            <div className="translation-fields">
              {Object.entries(detail.source).map(([key, source]) => (
                <div className="translation-field" key={key}>
                  <div className="translation-source">
                    <div>
                      <span>{t("منبع فارسی")}</span>
                      <code dir="ltr">{key}</code>
                    </div>
                    <p lang="fa" dir="rtl">
                      {source.replace(/\\u200c/g, "\u200c")}
                    </p>
                    {detail.translation[key] &&
                      detail.translation[key].source !== source && (
                        <span className="translation-review">
                          {t("منبع تغییر کرده؛ ترجمه را بازبینی کنید.")}
                        </span>
                      )}
                  </div>
                  <label className="field">
                    <span>{t("English")}</span>
                    <textarea
                      lang="en"
                      dir="ltr"
                      aria-label={t("ترجمه انگلیسی") + " — " + key}
                      value={fields[key] || ""}
                      rows={source.length > 160 ? 5 : 2}
                      maxLength={30000}
                      onChange={(e) =>
                        setFields((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
            <div className="admin-editor-footer">
              <button className="button primary" disabled={busy} type="submit">
                {busy ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                {busy ? t("در حال ذخیره…") : t("ذخیره ترجمه")}
              </button>
              <button
                className="button secondary"
                type="button"
                disabled={busy}
                onClick={() => setDetail(null)}
              >
                {t("انصراف")}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
