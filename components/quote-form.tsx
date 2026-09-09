"use client";
import { useI18n } from "@/i18n/use-i18n";

import { usePreferences } from "./preferences";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "@/i18n/navigation";
import {
  ArrowLeft,
  Check,
  Phone,
  MessageCircle,
  Mail,
  Trash2,
  Plus,
  Minus,
  LoaderCircle,
  ShieldCheck,
  Copy,
  FileCheck2,
  ChevronLeft,
  Info,
} from "lucide-react";
import type { ProductSummary } from "@/lib/types";
import { quoteSchema } from "@/lib/validation";
import { apiRequest } from "@/lib/client-api";
import { ProductPicker } from "./product-picker";
import { ProductImage } from "./ui";
import { faNumber, normalizeDigits } from "@/lib/format";
import { useStore } from "./store";
import { track } from "@/lib/analytics";
type QuoteDraft = {
  key: string;
  items: Item[];
  purpose: "quote" | "consultation";
  method: "phone" | "whatsapp" | "email";
  values: Record<string, string>;
  reference: string;
  sample: boolean;
  idempotency: string;
};
type Item = {
  product: ProductSummary;
  quantity: number;
};
export function QuoteForm({
  initialProducts = [],
  consultation = false,
  sample = true,
}: {
  initialProducts?: ProductSummary[];
  consultation?: boolean;
  sample?: boolean;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { quoteDraft } = usePreferences();
  const params = useSearchParams();
  const draftKey = params.toString();
  const candidate = quoteDraft.current as QuoteDraft | null;
  const initialDraft = useRef(
    candidate?.key === draftKey ? candidate : null,
  ).current;
  const [items, setItems] = useState<Item[]>(
      initialDraft?.items ||
        initialProducts.map((product) => ({ product, quantity: 1 })),
    ),
    [purpose, setPurpose] = useState<"quote" | "consultation">(
      initialDraft?.purpose || (consultation ? "consultation" : "quote"),
    ),
    [method, setMethod] = useState<"phone" | "whatsapp" | "email">(
      initialDraft?.method || "phone",
    ),
    [fields, setFields] = useState<Record<string, string>>({}),
    [error, setError] = useState(""),
    [sending, setSending] = useState(false),
    [reference, setReference] = useState(initialDraft?.reference || ""),
    [isSample, setIsSample] = useState(initialDraft?.sample ?? sample);
  const { toast, ready } = useStore();
  const formRef = useRef<HTMLFormElement>(null),
    idempotency = useRef(initialDraft?.idempotency || ""),
    lock = useRef(false);
  useEffect(() => {
    const capture = () => {
      const values =
        formRef.current && !reference
          ? Object.fromEntries(
              [...new FormData(formRef.current).entries()].map(
                ([key, value]) => [key, String(value)],
              ),
            )
          : {};
      quoteDraft.current = {
        key: draftKey,
        items,
        purpose,
        method,
        values,
        reference,
        sample: isSample,
        idempotency: idempotency.current,
      } satisfies QuoteDraft;
    };
    window.addEventListener("kv:before-language-change", capture);
    return () =>
      window.removeEventListener("kv:before-language-change", capture);
  }, [items, purpose, method, reference, isSample, draftKey, quoteDraft]);
  useEffect(() => {
    if (initialDraft && quoteDraft.current === initialDraft)
      quoteDraft.current = null;
  }, [initialDraft, quoteDraft]);
  function quantity(id: string, qty: number) {
    setItems((rows) =>
      rows.map((r) =>
        r.product.id === id
          ? { ...r, quantity: Math.max(1, Math.min(100000, qty)) }
          : r,
      ),
    );
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    setError("");
    setFields({});
    const form = new FormData(e.currentTarget);
    if (!idempotency.current) idempotency.current = crypto.randomUUID();
    const data = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      notes: String(form.get("notes") || ""),
      website: String(form.get("website") || ""),
      consent: form.get("consent") === "on",
      purpose,
      preferredContact: method,
      items: items.map((r) => ({
        productId: r.product.id,
        quantity: r.quantity,
      })),
      idempotencyKey: idempotency.current,
    };
    const validation = quoteSchema.safeParse(data);
    if (!validation.success) {
      const errs: Record<string, string> = {};
      validation.error.issues.forEach((i) => {
        errs[String(i.path[0])] = i.message;
      });
      setFields(errs);
      const first = Object.keys(errs)[0];
      setTimeout(
        () =>
          formRef.current
            ?.querySelector<HTMLInputElement>(`[name="${first}"]`)
            ?.focus(),
        0,
      );
      setError(tr("لطفاً بخش‌های مشخص‌شده را بررسی کنید."));
      return;
    }
    lock.current = true;
    setSending(true);
    try {
      const result = await apiRequest("/api/quotes", validation.data);
      setReference(result.reference);
      setIsSample(result.sample);
      track("request_quote", {
        product_ids: items.map((i) => i.product.id),
        item_count: items.length,
        purpose,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const e = err as Error & {
        fields?: Record<string, string>;
      };
      setError(e.message || tr("ارتباط با سرور برقرار نشد. دوباره تلاش کنید."));
      if (e.fields) setFields(e.fields);
    } finally {
      setSending(false);
      lock.current = false;
    }
  }
  if (reference)
    return (
      <div className="quote-confirmation">
        <div className="confirmation-icon">
          <FileCheck2 size={44} />
        </div>
        <span className="eyebrow">{tr("درخواست با موفقیت ذخیره شد")}</span>
        <h1>
          {tr(
            isSample
              ? tr("درخواست آزمایشی شما ثبت شد.")
              : tr("درخواست شما ثبت شد."),
          )}
        </h1>
        <p>
          {tr(
            "کد پیگیری را نگه دارید تا در مراجعه بعدی به درخواست خود اشاره کنید.",
          )}
        </p>
        <div className="reference-box">
          <span>{tr("کد پیگیری")}</span>
          <bdi>{tr(reference)}</bdi>
          <button
            className="icon-button"
            aria-label={tr("کپی کد پیگیری")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(reference);
                toast(tr("کد پیگیری کپی شد."));
              } catch {
                toast(tr("کد پیگیری را انتخاب و کپی کنید."));
              }
            }}
          >
            <Copy size={18} />
          </button>
        </div>
        {isSample && (
          <div className="confirmation-note">
            <Info size={19} />
            <p>
              {tr(
                "این درخواست در پایگاه داده همین نسخه ذخیره شده است. در محیط آزمایشی، پیامک یا ایمیل ارسال نمی‌شود و تماس واقعی برنامه‌ریزی نشده است.",
              )}
            </p>
          </div>
        )}
        <div className="confirmation-actions">
          <Link className="button primary" href="/products">
            {tr("ادامه بررسی محصولات")}
            <ArrowLeft size={18} />
          </Link>
          <button
            className="button secondary"
            onClick={() => {
              setReference("");
              idempotency.current = "";
              setItems([]);
              setFields({});
              setError("");
            }}
          >
            {tr("درخواست جدید")}
          </button>
        </div>
      </div>
    );
  const err = (key: string) =>
    fields[key] ? (
      <span id={`error-${key}`} className="field-error">
        {tr(fields[key])}
      </span>
    ) : null;
  return (
    <div className="quote-layout">
      <form
        method="post"
        action={localizedPath("/api/quotes")}
        className="quote-form"
        ref={formRef}
        onSubmit={submit}
        noValidate
      >
        <section className="form-section">
          <div className="form-section-heading">
            <span>{tr("۰۱")}</span>
            <h2>{tr("چطور می‌توانیم کمک کنیم؟")}</h2>
          </div>
          <div
            className="purpose-options"
            role="radiogroup"
            aria-label={tr("نوع درخواست")}
          >
            <label className={purpose === "quote" ? "selected" : ""}>
              <input
                type="radio"
                name="purpose"
                value="quote"
                checked={purpose === "quote"}
                onChange={() => setPurpose("quote")}
              />
              <FileCheck2 size={19} />
              <span>
                {tr("استعلام قیمت محصول")}
                <small>{tr("قیمت، موجودی و شرایط تأمین")}</small>
              </span>
              <span className="radio-mark" />
            </label>
            <label className={purpose === "consultation" ? "selected" : ""}>
              <input
                type="radio"
                name="purpose"
                value="consultation"
                checked={purpose === "consultation"}
                onChange={() => setPurpose("consultation")}
              />
              <MessageCircle size={19} />
              <span>
                {tr("مشاوره انتخاب ابزار")}
                <small>{tr("راهنمایی بر اساس نیاز پروژه")}</small>
              </span>
              <span className="radio-mark" />
            </label>
          </div>
        </section>
        <section className="form-section">
          <div className="form-section-heading">
            <span>{tr("۰۲")}</span>
            <h2>{tr("محصولات موردنظر")}</h2>
            <small>
              {tr(
                purpose === "consultation"
                  ? tr("اختیاری برای مشاوره")
                  : tr("حداکثر ۱۰ محصول"),
              )}
            </small>
          </div>
          {items.length > 0 && (
            <div className="quote-items">
              {items.map(({ product: p, quantity: qty }) => (
                <div className="quote-item" key={p.id}>
                  <ProductImage
                    src={p.images[0]?.url || "/images/hero.webp"}
                    alt={tr(p.name)}
                    sizes="72px"
                  />
                  <div className="quote-item-name">
                    <Link href={`/product/${p.slug}`}>{tr(p.name)}</Link>
                    <bdi>{tr(p.model)}</bdi>
                  </div>
                  <div className="quantity-input">
                    <button
                      type="button"
                      aria-label={tr("افزایش تعداد {v0}", { v0: tr(p.name) })}
                      onClick={() => quantity(p.id, qty + 1)}
                      disabled={qty >= 100000}
                    >
                      <Plus size={14} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label={tr("تعداد {v0}", { v0: tr(p.name) })}
                      value={fmtNumber(qty).replace(/٬/g, "")}
                      onChange={(e) =>
                        quantity(
                          p.id,
                          parseInt(
                            normalizeDigits(e.target.value).replace(/\D/g, ""),
                          ) || 1,
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label={tr("کاهش تعداد {v0}", { v0: tr(p.name) })}
                      onClick={() => quantity(p.id, qty - 1)}
                      disabled={qty <= 1}
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="icon-button remove-quote-item"
                    aria-label={tr("حذف {v0} از درخواست", { v0: tr(p.name) })}
                    onClick={() =>
                      setItems((rows) =>
                        rows.filter((r) => r.product.id !== p.id),
                      )
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {items.length < 10 && (
            <ProductPicker
              selectedIds={items.map((i) => i.product.id)}
              onSelect={(p) => {
                setItems((rows) => [...rows, { product: p, quantity: 1 }]);
                setFields((prev) => ({ ...prev, items: "" }));
              }}
            />
          )}
          {err("items")}
          <p className="form-hint">
            {tr(
              "مدل دقیق را نمی‌دانید؟ «مشاوره انتخاب ابزار» را انتخاب کنید و نیازتان را بنویسید.",
            )}
          </p>
        </section>
        <section className="form-section">
          <div className="form-section-heading">
            <span>{tr("۰۳")}</span>
            <h2>{tr("اطلاعات تماس شما")}</h2>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="quote-name">
                {tr("نام و نام خانوادگی ")}
                <span>*</span>
              </label>
              <input
                id="quote-name"
                name="name"
                defaultValue={initialDraft?.values.name || ""}
                type="text"
                autoComplete="name"
                placeholder={tr("نام کامل شما")}
                maxLength={100}
                required
                aria-invalid={!!fields.name}
                aria-describedby={fields.name ? "error-name" : undefined}
              />
              {err("name")}
            </div>
            <div className="field">
              <label htmlFor="quote-phone">
                {tr("شماره تماس ")}
                <span>*</span>
              </label>
              <input
                id="quote-phone"
                name="phone"
                defaultValue={initialDraft?.values.phone || ""}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                className="ltr-input"
                placeholder={tr("۰۹۱۲۱۲۳۴۵۶۷")}
                maxLength={25}
                required
                aria-invalid={!!fields.phone}
                aria-describedby={fields.phone ? "error-phone" : undefined}
              />
              {err("phone")}
            </div>
          </div>
          <fieldset className="contact-methods">
            <legend>{tr("روش تماس ترجیحی")}</legend>
            <div>
              {[
                { value: "phone", label: tr("تماس تلفنی"), icon: Phone },
                {
                  value: "whatsapp",
                  label: tr("واتس‌اپ"),
                  icon: MessageCircle,
                },
                { value: "email", label: tr("ایمیل"), icon: Mail },
              ].map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={method === value ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="preferredContact"
                    value={value}
                    checked={method === value}
                    onChange={() => setMethod(value as typeof method)}
                  />
                  <Icon size={16} />
                  {tr(label)}
                  <span className="radio-mark" />
                </label>
              ))}
            </div>
          </fieldset>
          {method === "email" && (
            <div className="field">
              <label htmlFor="quote-email">
                {tr("ایمیل ")}
                <span>*</span>
              </label>
              <input
                id="quote-email"
                name="email"
                defaultValue={initialDraft?.values.email || ""}
                type="email"
                autoComplete="email"
                dir="ltr"
                placeholder="you@example.com"
                maxLength={200}
                required
                aria-invalid={!!fields.email}
                aria-describedby={fields.email ? "error-email" : undefined}
              />
              {err("email")}
            </div>
          )}
        </section>
        <section className="form-section">
          <div className="field">
            <label htmlFor="quote-notes">
              {tr("درباره نیازتان بیشتر بگویید ")}
              <small>{tr("اختیاری")}</small>
            </label>
            <textarea
              id="quote-notes"
              name="notes"
              defaultValue={initialDraft?.values.notes || ""}
              placeholder={tr(
                "نوع پروژه، شرایط کار، تعداد موردنیاز یا پرسش فنی خود را بنویسید…",
              )}
              rows={4}
              maxLength={2000}
              aria-invalid={!!fields.notes}
            />
            <span className="form-hint">
              {tr("تا ۲۰۰۰ نویسه؛ نیازی به ارسال اطلاعات حساس پروژه نیست.")}
            </span>
            {err("notes")}
          </div>
        </section>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">{tr("وب‌سایت")}</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <label className="consent-label">
          <input
            name="consent"
            defaultChecked={initialDraft?.values.consent === "on"}
            type="checkbox"
            aria-invalid={!!fields.consent}
            aria-describedby={fields.consent ? "error-consent" : undefined}
          />
          <span>
            {tr("با استفاده از اطلاعات تماس من برای پاسخ به این درخواست، طبق")}{" "}
            <Link href="/privacy" target="_blank">
              {tr("حریم خصوصی")}
            </Link>{" "}
            {tr("موافقم.")}
          </span>
        </label>
        {err("consent")}
        {error && (
          <div className="form-error" role="alert">
            <Info size={18} />
            {tr(error)}
          </div>
        )}
        <div className="quote-submit-row">
          <button
            type="submit"
            className="button primary"
            disabled={sending || !ready}
          >
            {sending ? (
              <>
                <LoaderCircle className="spin" size={18} />
                {tr("در حال ثبت درخواست…")}
              </>
            ) : (
              <>
                {tr("ارسال درخواست")}
                <ArrowLeft size={19} />
              </>
            )}
          </button>
          <span>
            <ShieldCheck size={16} />
            {tr("این فرم تعهدی برای خرید ایجاد نمی‌کند.")}
          </span>
        </div>
      </form>
      <aside className="quote-aside">
        <div className="quote-aside-card">
          <span className="eyebrow light">{tr("از انتخاب تا استعلام")}</span>
          <h2>
            {tr("یک قدم نزدیک‌تر")}
            <br />
            {tr("به ابزار مناسب.")}
          </h2>
          <p>
            {tr(
              "هرچه نیازتان دقیق‌تر باشد، بررسی گزینه‌های مناسب ساده‌تر خواهد بود.",
            )}
          </p>
          <ol>
            <li>
              <span>{tr("۱")}</span>
              <div>
                <strong>{tr("مدل یا کاربرد را مشخص کنید")}</strong>
                <p>{tr("محصول را انتخاب کنید یا شرایط کار را بنویسید.")}</p>
              </div>
            </li>
            <li>
              <span>{tr("۲")}</span>
              <div>
                <strong>{tr("تعداد و راه ارتباطی را بنویسید")}</strong>
                <p>{tr("اطلاعات لازم برای بررسی درخواست، نه بیشتر.")}</p>
              </div>
            </li>
            <li>
              <span>{tr("۳")}</span>
              <div>
                <strong>{tr("کد پیگیری دریافت کنید")}</strong>
                <p>{tr("ثبت درخواست را با یک شناسه مشخص دنبال کنید.")}</p>
              </div>
            </li>
          </ol>
          <div className="quote-aside-bottom">
            <MessageCircle size={21} />
            <span>
              {tr("برای تصمیم‌گیری عجله نکنید.")}
              <br />
              {tr("اول مشخصات را بررسی کنید.")}
            </span>
          </div>
        </div>
        {sample && (
          <div className="quote-sample-note">
            <Info size={18} />
            <div>
              <strong>{tr("درباره این نسخه")}</strong>
              <p>
                {tr(
                  "درخواست واقعاً در پایگاه داده محلی ثبت می‌شود؛ ارسال پیامک، ایمیل و تماس خودکار فعال نیست.",
                )}
              </p>
            </div>
          </div>
        )}
        <Link className="text-link" href="/products">
          {tr("بازگشت به کاتالوگ")}
          <ArrowLeft size={17} />
        </Link>
      </aside>
    </div>
  );
}
