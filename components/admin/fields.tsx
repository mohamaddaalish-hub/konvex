"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useId, useState } from "react";
import { Upload, LoaderCircle } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  dir,
  required = false,
  hint,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  dir?: "ltr" | "rtl";
  required?: boolean;
  hint?: string;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {tr(label)}
        {required && <span aria-hidden="true">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          dir={dir}
          required={required}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
          required={required}
        />
      )}{" "}
      {hint && <span className="form-hint">{tr(hint)}</span>}
    </div>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{tr(label)}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {tr(o.label)}
          </option>
        ))}
      </select>
    </div>
  );
}
export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <label className="admin-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{tr(label)}</span>
    </label>
  );
}
export function ImageUpload({
  onUpload,
  label = "بارگذاری تصویر",
}: {
  onUpload: (url: string) => void;
  label?: string;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const id = useId();
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await apiRequest("/api/admin/upload", data);
      onUpload(result.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="upload-field">
      <label
        htmlFor={id}
        className={`button secondary small ${busy ? "disabled" : ""}`}
      >
        {busy ? (
          <LoaderCircle className="spin" size={17} />
        ) : (
          <Upload size={17} />
        )}{" "}
        {tr(busy ? tr("در حال پردازش…") : label)}
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
        className="sr-only"
      />
      <small>{tr("JPG، PNG، WebP — تا ۵ مگابایت؛ بهینه‌سازی خودکار")}</small>
      {error && (
        <p className="field-error" role="alert">
          {tr(error)}
        </p>
      )}
    </div>
  );
}
