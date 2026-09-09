"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useState } from "react";
import { Save, LoaderCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { TextField, CheckboxField } from "./fields";
import { apiRequest } from "@/lib/client-api";
import { useStore } from "../store";
import { useRouter } from "@/i18n/navigation";
export function SettingsEditor({ settings }: { settings: SiteSettings }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [s, setS] = useState(settings),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { toast, ready } = useStore(),
    router = useRouter();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/admin/settings", s);
      toast(tr("تنظیمات سایت ذخیره شد."));
      router.refresh();
    } catch (e) {
      const err = e as Error & {
        details?: string;
      };
      setError(err.message + (err.details ? " " + err.details : ""));
    } finally {
      setBusy(false);
    }
  }
  const fields: {
    key: keyof SiteSettings;
    label: string;
    dir?: "ltr" | "rtl";
  }[] = [
    { key: "name", label: tr("نام فارسی برند") },
    { key: "englishName", label: tr("نام لاتین برند"), dir: "ltr" },
    { key: "tagline", label: tr("شعار برند") },
    { key: "phone", label: tr("شماره تماس — با ارقام انگلیسی"), dir: "ltr" },
    { key: "whatsapp", label: tr("واتس‌اپ — کد کشور و شماره"), dir: "ltr" },
    { key: "email", label: tr("ایمیل"), dir: "ltr" },
    { key: "address", label: tr("نشانی رسمی") },
    { key: "hours", label: tr("ساعت پاسخ‌گویی") },
    { key: "mapUrl", label: tr("لینک نقشه — HTTPS"), dir: "ltr" },
    { key: "instagram", label: tr("لینک اینستاگرام — HTTPS"), dir: "ltr" },
    { key: "linkedin", label: tr("لینک لینکدین — HTTPS"), dir: "ltr" },
  ];
  return (
    <form
      method="post"
      action={localizedPath("/api/admin/settings")}
      onSubmit={save}
      className="settings-form"
    >
      <div className="admin-help">
        {tr(
          "کانال‌های خالی، لینک ساختگی ندارند. با ثبت شماره و نشانی تأییدشده، مسیرهای تماس در سایت فعال می‌شوند.",
        )}
      </div>
      <div className="form-grid">
        {fields.map((f) => (
          <TextField
            key={f.key}
            label={tr(f.label)}
            value={String(s[f.key])}
            dir={f.dir}
            onChange={(v) => setS((prev) => ({ ...prev, [f.key]: v }))}
          />
        ))}
      </div>
      <CheckboxField
        label={tr("نمایش هشدار محیط آزمایشی")}
        checked={s.sampleMode}
        onChange={(sampleMode) => setS((prev) => ({ ...prev, sampleMode }))}
      />
      <p className="form-hint">
        {tr(
          "خاموش کردن هشدار، داده‌ها را تأیید نمی‌کند و سرویس پیامک یا پرداخت را فعال نمی‌کند. اتصال سرویس‌ها و دامنه رسمی، تنظیمات استقرار جداگانه دارند.",
        )}
      </p>
      {error && (
        <div className="form-error" role="alert">
          {tr(error)}
        </div>
      )}
      <button className="button primary" disabled={busy || !ready}>
        {busy ? (
          <LoaderCircle size={18} className="spin" />
        ) : (
          <Save size={18} />
        )}
        {tr("ذخیره تنظیمات")}
      </button>
    </form>
  );
}
