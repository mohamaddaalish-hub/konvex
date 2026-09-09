"use client";
import { usePreferences } from "../preferences";
import { ThemeSwitcher, LanguageSwitcher } from "../preferences";
import { useI18n } from "@/i18n/use-i18n";

import { useState } from "react";
import Link from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  Package,
  LayoutGrid,
  Tags,
  BookOpen,
  MessagesSquare,
  Settings2,
  LogOut,
  ArrowUpLeft,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  LoaderCircle,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import type {
  Product,
  ProductSummary,
  Category,
  Brand,
  Application,
  Article,
  SiteSettings,
  Quote,
} from "@/lib/types";
import { faNumber } from "@/lib/format";
import { apiRequest } from "@/lib/client-api";
import { Brandmark, ProductImage, EmptyState } from "../ui";
import { useStore } from "../store";
import { TranslationsPanel } from "./translations-panel";
import { ProductEditor, newProduct } from "./product-editor";
import { EntityEditor, newEntity } from "./entity-editor";
import { SettingsEditor } from "./settings-editor";
type Props = {
  tab: string;
  products: ProductSummary[];
  totalProducts: number;
  productPage: number;
  productPages: number;
  categories: Category[];
  brands: Brand[];
  applications: Application[];
  articles: Article[];
  quotes: Quote[];
  totalQuotes: number;
  quotePage: number;
  quotePages: number;
  settings: SiteSettings;
  query: string;
};
export function AdminDashboard(props: Props) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { mergeDictionary } = usePreferences();
  const {
    tab,
    products,
    totalProducts,
    productPage,
    productPages,
    categories,
    brands,
    applications,
    articles,
    quotes,
    totalQuotes,
    quotePage,
    quotePages,
    settings,
    query,
  } = props;
  const [editing, setEditing] = useState<Product | null>(null),
    [entity, setEntity] = useState<{
      type: "category" | "brand" | "article";
      data: Category | Brand | Article;
    } | null>(null),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const router = useRouter(),
    { toast } = useStore();
  const nav = [
    {
      id: "products",
      name: tr("محصولات"),
      icon: Package,
      count: totalProducts,
    },
    {
      id: "categories",
      name: tr("دسته‌بندی‌ها"),
      icon: LayoutGrid,
      count: categories.length,
    },
    { id: "brands", name: tr("برندها"), icon: Tags, count: brands.length },
    {
      id: "articles",
      name: tr("دانشنامه"),
      icon: BookOpen,
      count: articles.length,
    },
    {
      id: "quotes",
      name: tr("درخواست‌ها"),
      icon: MessagesSquare,
      count: totalQuotes,
    },
    { id: "settings", name: tr("تنظیمات سایت"), icon: Settings2 },
    { id: "translations", name: tr("ترجمه‌ها"), icon: BookOpen },
  ];
  async function logout() {
    try {
      await apiRequest("/api/admin/logout", {});
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function edit(id: string) {
    setBusy(id);
    setError("");
    try {
      const r = await fetch("/api/admin/products?id=" + id, {
        cache: "no-store",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      mergeDictionary(d.dictionary || {});
      setEditing(d.product);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function remove(type: string, id: string, name: string) {
    if (
      !confirm(
        tr("«{v0}» حذف شود؟ این عملیات برگشت‌پذیر نیست.", { v0: tr(name) }),
      )
    )
      return;
    setBusy(id);
    setError("");
    try {
      await apiRequest(
        type === "product"
          ? "/api/admin/products"
          : type === "quote"
            ? "/api/admin/quotes"
            : "/api/admin/entities",
        type === "product" || type === "quote" ? { id } : { id, type },
        "DELETE",
      );
      toast(tr("مورد انتخاب‌شده حذف شد."));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  function saved() {
    setEditing(null);
    setEntity(null);
    toast(tr("تغییرات با موفقیت ذخیره شد."));
    router.refresh();
  }
  async function status(id: string, status: string) {
    try {
      await apiRequest("/api/admin/quotes", { id, status });
      toast(tr("وضعیت درخواست به‌روزرسانی شد."));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const title = nav.find((n) => n.id === tab)?.name || tr("محصولات");
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/">
          <Brandmark
            small
            name={settings.englishName}
            persian={settings.name}
          />
        </Link>
        <span>
          <ShieldCheck size={17} />
          {tr("مدیریت کاتالوگ کانوکس")}
        </span>
        <div className="admin-header-actions">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Link href="/" target="_blank" className="text-link">
            {tr("مشاهده وب‌سایت")}
            <ArrowUpLeft size={17} />
          </Link>
          <button
            className="icon-button"
            onClick={logout}
            aria-label={tr("خروج از مدیریت")}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <span className="english-label" dir="ltr">
            CONTENT MANAGEMENT
          </span>
          <nav aria-label={tr("مدیریت محتوا")}>
            {nav.map((n) => (
              <Link
                key={n.id}
                href={`/admin?tab=${n.id}`}
                className={tab === n.id ? "active" : ""}
              >
                <n.icon size={19} />
                {tr(n.name)}
                {n.count !== undefined && <small>{fmtNumber(n.count)}</small>}
              </Link>
            ))}
          </nav>
          <div className="admin-sidebar-note">
            <span />
            {tr("محیط محلی و آزمایشی")}
            <p>{tr("از اطلاعات واقعی مشتریان برای آزمون استفاده نکنید.")}</p>
          </div>
        </aside>
        <section className="admin-content">
          <div className="admin-page-heading">
            <div>
              <span className="eyebrow">
                {tr("مرکز مدیریت / ")}
                {tr(title)}
              </span>
              <h1>{tr(title)}</h1>
            </div>
            {tab === "products" && (
              <button
                className="button primary small"
                disabled={!categories.length || !brands.length}
                onClick={() => setEditing(newProduct(categories[0], brands[0]))}
              >
                <Plus size={17} />
                {tr("افزودن محصول")}
              </button>
            )}
            {["categories", "brands", "articles"].includes(tab) && (
              <button
                className="button primary small"
                onClick={() => {
                  const type =
                    tab === "categories"
                      ? "category"
                      : tab === "brands"
                        ? "brand"
                        : "article";
                  setEntity({ type, data: newEntity(type, categories) });
                }}
              >
                <Plus size={17} />
                {tr("افزودن")}{" "}
                {tr(
                  tab === "categories"
                    ? tr("دسته")
                    : tab === "brands"
                      ? tr("برند")
                      : tr("مقاله"),
                )}
              </button>
            )}
          </div>
          {error && (
            <div className="form-error" role="alert">
              {tr(error)}
            </div>
          )}
          {tab === "products" && (
            <>
              <form
                className="admin-list-search catalog-search"
                action={localizedPath("/admin")}
              >
                <input type="hidden" name="tab" value="products" />
                <Search size={18} />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={tr("جستجوی نام، مدل یا کد کالا…")}
                  aria-label={tr("جستجوی محصولات مدیریت")}
                />
                <button type="submit" className="button secondary small">
                  {tr("جستجو")}
                </button>
              </form>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{tr("محصول")}</th>
                      <th>{tr("مدل / شناسه")}</th>
                      <th>{tr("دسته")}</th>
                      <th>{tr("وضعیت")}</th>
                      <th>{tr("قیمت")}</th>
                      <th>{tr("عملیات")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="admin-product-cell">
                            <ProductImage
                              src={p.images[0]?.url || "/images/hero.webp"}
                              alt=""
                              sizes="52px"
                            />
                            <span>
                              {tr(p.name)}
                              <small>
                                {tr(
                                  p.isSample
                                    ? tr("نمونه")
                                    : tr("تأییدشده توسط مدیر"),
                                )}
                                {tr(p.featured ? tr(" / منتخب") : "")}
                              </small>
                            </span>
                          </div>
                        </td>
                        <td>
                          <bdi>{tr(p.model)}</bdi>
                          <small className="admin-product-id" dir="ltr">
                            {tr(p.id)}
                          </small>
                        </td>
                        <td>
                          {tr(
                            categories.find((c) => c.id === p.categoryId)?.name,
                          )}
                        </td>
                        <td>
                          <span className="admin-status">
                            {tr(
                              p.availability === "inquiry"
                                ? tr("استعلام")
                                : p.availability === "in_stock"
                                  ? tr("موجود")
                                  : tr("ناموجود"),
                            )}
                          </span>
                        </td>
                        <td>
                          {tr(
                            p.price === null
                              ? tr("استعلام")
                              : fmtNumber(p.price),
                          )}
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <Link
                              className="icon-button"
                              href={`/product/${p.slug}`}
                              target="_blank"
                              aria-label={tr("مشاهده {v0}", { v0: tr(p.name) })}
                            >
                              <ExternalLink size={16} />
                            </Link>
                            <button
                              className="icon-button"
                              onClick={() => edit(p.id)}
                              disabled={busy === p.id}
                              aria-label={tr("ویرایش {v0}", { v0: tr(p.name) })}
                            >
                              {busy === p.id ? (
                                <LoaderCircle size={16} className="spin" />
                              ) : (
                                <Edit3 size={17} />
                              )}
                            </button>
                            <button
                              className="icon-button danger-text"
                              onClick={() => remove("product", p.id, p.name)}
                              disabled={busy === p.id}
                              aria-label={tr("حذف {v0}", { v0: tr(p.name) })}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!products.length && (
                <EmptyState title={tr("محصولی پیدا نشد.")} />
              )}
              {productPages > 1 && (
                <AdminPagination
                  current={productPage}
                  pages={productPages}
                  href={`/admin?tab=products&q=${encodeURIComponent(query)}`}
                />
              )}
            </>
          )}
          {["categories", "brands", "articles"].includes(tab) && (
            <div className="admin-entity-grid">
              {(tab === "categories"
                ? categories
                : tab === "brands"
                  ? brands
                  : articles
              ).map((e) => {
                const type =
                    tab === "categories"
                      ? "category"
                      : tab === "brands"
                        ? "brand"
                        : "article",
                  name = "name" in e ? e.name : e.title,
                  image = "image" in e ? e.image : "logo" in e ? e.logo : "";
                return (
                  <article className="admin-entity-card" key={e.id}>
                    {image ? (
                      <ProductImage src={image} alt={tr(name)} sizes="300px" />
                    ) : (
                      <div className="admin-entity-brand">
                        <Brandmark name={(e as Brand).english} persian={name} />
                      </div>
                    )}
                    <div>
                      <h2>{tr(name)}</h2>
                      <p>
                        {tr(
                          "description" in e
                            ? e.description
                            : "excerpt" in e
                              ? e.excerpt
                              : "",
                        )}
                      </p>
                      {"count" in e && (
                        <span className="small muted">
                          {fmtNumber(e.count || 0)}
                          {tr(" محصول")}
                        </span>
                      )}
                      <div className="admin-entity-actions">
                        <button
                          className="button secondary small"
                          onClick={() => setEntity({ type, data: e })}
                        >
                          <Edit3 size={15} />
                          {tr("ویرایش")}
                        </button>
                        <button
                          className="icon-button danger-text"
                          aria-label={tr("حذف {v0}", { v0: tr(name) })}
                          onClick={() => remove(type, e.id, name)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {tab === "quotes" && (
            <>
              {quotes.length ? (
                <div className="admin-quotes">
                  {quotes.map((q) => (
                    <details key={q.id} className="admin-quote-card">
                      <summary>
                        <MessagesSquare size={20} />
                        <div>
                          <strong>{q.name}</strong>
                          <bdi>{tr(q.reference)}</bdi>
                        </div>
                        <span className="admin-status">
                          {tr(
                            {
                              new: tr("جدید"),
                              reviewing: tr("در حال بررسی"),
                              answered: tr("پاسخ داده‌شده"),
                              archived: tr("بایگانی"),
                            }[q.status] || q.status,
                          )}
                        </span>
                        <time>
                          {tr(
                            new Date(q.createdAt).toLocaleDateString(
                              locale === "en" ? "en-GB" : "fa-IR",
                              {
                                timeZone: "Asia/Tehran",
                              },
                            ),
                          )}
                        </time>
                        <ChevronDown size={18} />
                      </summary>
                      <div className="admin-quote-details">
                        <div className="admin-quote-contact">
                          <span>
                            {tr("تلفن: ")}
                            <bdi>{q.phone}</bdi>
                          </span>
                          {q.email && (
                            <span>
                              {tr("ایمیل: ")}
                              <bdi>{q.email}</bdi>
                            </span>
                          )}
                          <span>
                            {tr("روش ترجیحی:")}{" "}
                            {tr(
                              {
                                phone: tr("تلفن"),
                                whatsapp: tr("واتس‌اپ"),
                                email: tr("ایمیل"),
                              }[q.preferredContact],
                            )}
                          </span>
                          <span>
                            {tr("نوع:")}{" "}
                            {tr(
                              q.purpose === "quote"
                                ? tr("استعلام قیمت")
                                : tr("مشاوره"),
                            )}
                          </span>
                        </div>
                        {q.items.length > 0 && (
                          <ul>
                            {q.items.map((i) => (
                              <li key={i.productId}>
                                <span>
                                  {tr(i.name)} <bdi>{tr(i.model)}</bdi>
                                </span>
                                <strong>
                                  {fmtNumber(i.quantity)}
                                  {tr(" عدد")}
                                </strong>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="admin-quote-notes">
                          <h3>{tr("توضیحات")}</h3>
                          <p>{q.notes || tr("توضیحی نوشته نشده است.")}</p>
                        </div>
                        <div className="admin-quote-footer">
                          <label>
                            {tr("وضعیت درخواست")}
                            <select
                              value={q.status}
                              onChange={(e) => status(q.id, e.target.value)}
                              aria-label={tr("وضعیت درخواست {v0}", {
                                v0: tr(q.reference),
                              })}
                            >
                              <option value="new">{tr("جدید")}</option>
                              <option value="reviewing">
                                {tr("در حال بررسی")}
                              </option>
                              <option value="answered">
                                {tr("پاسخ داده‌شده")}
                              </option>
                              <option value="archived">{tr("بایگانی")}</option>
                            </select>
                          </label>
                          <button
                            className="text-link danger-text"
                            onClick={() => remove("quote", q.id, q.reference)}
                          >
                            <Trash2 size={16} />
                            {tr("حذف دائمی اطلاعات")}
                          </button>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={tr("هنوز درخواستی ثبت نشده است.")}
                  description={tr(
                    "پس از ثبت فرم قیمت یا مشاوره، درخواست‌ها با کد پیگیری در این بخش ظاهر می‌شوند.",
                  )}
                  actionHref="/quote"
                  actionLabel={tr("مشاهده فرم استعلام")}
                />
              )}
              {quotePages > 1 && (
                <AdminPagination
                  current={quotePage}
                  pages={quotePages}
                  href="/admin?tab=quotes"
                />
              )}
            </>
          )}
          {tab === "translations" && <TranslationsPanel />}
          {tab === "settings" && <SettingsEditor settings={settings} />}
        </section>
      </div>
      {editing && (
        <ProductEditor
          key={editing.id}
          product={editing}
          categories={categories}
          brands={brands}
          applications={applications}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}{" "}
      {entity && (
        <EntityEditor
          key={entity.data.id}
          type={entity.type}
          entity={entity.data}
          categories={categories}
          onClose={() => setEntity(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}
function AdminPagination({
  current,
  pages,
  href,
}: {
  current: number;
  pages: number;
  href: string;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <nav className="admin-pagination" aria-label={tr("صفحه‌های مدیریت")}>
      {current > 1 && (
        <Link
          className="button secondary small"
          href={href + "&page=" + (current - 1)}
        >
          {tr("قبلی")}
        </Link>
      )}
      <span>
        {tr("صفحه ")}
        {fmtNumber(current)}
        {tr(" از ")}
        {fmtNumber(pages)}
      </span>
      {current < pages && (
        <Link
          className="button secondary small"
          href={href + "&page=" + (current + 1)}
        >
          {tr("بعدی")}
        </Link>
      )}
    </nav>
  );
}
