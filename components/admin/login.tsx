"use client";
import { ThemeSwitcher, LanguageSwitcher } from "../preferences";
import { useI18n } from "@/i18n/use-i18n";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Link from "@/i18n/navigation";
import {
  LockKeyhole,
  ArrowLeft,
  LoaderCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Brandmark, ProductImage } from "../ui";
import { apiRequest } from "@/lib/client-api";
import { useStore } from "../store";
export function AdminLogin() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(false);
  const router = useRouter();
  const { ready } = useStore();
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      await apiRequest("/api/admin/login", {
        password: String(data.get("password") || ""),
      });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-login-page">
      <div className="login-preferences">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <div className="admin-login-card">
        <div className="admin-login-content">
          <Link href="/">
            <Brandmark />
          </Link>
          <div className="admin-login-title">
            <LockKeyhole size={24} />
            <span>{tr("مدیریت کاتالوگ")}</span>
          </div>
          <h1>{tr("خوش آمدید.")}</h1>
          <p>{tr("برای مدیریت محتوا و درخواست‌ها، وارد شوید.")}</p>
          <form
            method="post"
            action={localizedPath("/api/admin/login")}
            onSubmit={login}
          >
            <div className="field">
              <label htmlFor="admin-password">{tr("رمز مدیریت")}</label>
              <div className="password-field">
                <input
                  id="admin-password"
                  name="password"
                  type={visible ? "text" : "password"}
                  dir="ltr"
                  required
                  autoComplete="current-password"
                  maxLength={256}
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={tr(
                    visible ? tr("پنهان کردن رمز") : tr("نمایش رمز"),
                  )}
                  onClick={() => setVisible((v) => !v)}
                >
                  {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="form-error" id="login-error" role="alert">
                {tr(error)}
              </div>
            )}
            <button className="button primary full" disabled={busy || !ready}>
              {busy ? (
                <>
                  <LoaderCircle size={18} className="spin" />
                  {tr("در حال ورود…")}
                </>
              ) : (
                <>
                  {tr("ورود به مدیریت")}
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </form>
          <span className="admin-login-hint">
            {tr("دسترسی فقط برای مدیر مجاز مجموعه است.")}
          </span>
          <Link className="text-link" href="/">
            {tr("بازگشت به وب‌سایت")}
            <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="admin-login-image">
          <ProductImage
            src="/images/hero.webp"
            alt={tr("مجموعه ابزار کانوکس")}
            eager
            width={1264}
            height={848}
          />
          <span dir="ltr">
            KONVEX
            <br />
            <small>CATALOGUE CONTROL</small>
          </span>
        </div>
      </div>
    </div>
  );
}
