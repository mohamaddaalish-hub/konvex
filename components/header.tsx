"use client";
import { ThemeSwitcher, LanguageSwitcher } from "./preferences";
import { useI18n } from "@/i18n/use-i18n";

import { useEffect, useRef, useState } from "react";
import Link from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  Search,
  Heart,
  GitCompareArrows,
  Menu,
  ChevronDown,
  ArrowLeft,
  ArrowUpLeft,
  MessageCircle,
  X,
} from "lucide-react";
import type { Category, SiteSettings } from "@/lib/types";
import { Brandmark, ProductImage } from "./ui";
import { useStore } from "./store";
import { SearchDialog } from "./search-dialog";
import { Modal } from "./modal";
import { faNumber } from "@/lib/format";
export function Header({
  categories,
  settings,
}: {
  categories: Category[];
  settings: SiteSettings;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [search, setSearch] = useState(false),
    [menu, setMenu] = useState(false),
    [mega, setMega] = useState(false),
    [compact, setCompact] = useState(false);
  const pathname = usePathname();
  const { wishlist, compare, ready } = useStore();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const main = categories.filter((c) => !c.parentId && c.id !== "accessories");
  useEffect(() => {
    const scroll = () => setCompact(window.scrollY > 48);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    const key = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "k" || e.code === "KeyK")
      ) {
        e.preventDefault();
        setSearch((v) => !v);
      }
      if (e.key === "Escape") setMega(false);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("keydown", key);
    };
  }, []);
  useEffect(() => {
    setMega(false);
    setMenu(false);
    setSearch(false);
  }, [pathname, locale]);
  const openMega = () => {
    if (timer.current) clearTimeout(timer.current);
    setMega(true);
  };
  const closeMega = () => {
    timer.current = setTimeout(() => setMega(false), 150);
  };
  const links = [
    { href: "/applications", label: tr("کاربردها") },
    { href: "/brands", label: tr("برندها") },
    { href: "/new-products", label: tr("محصولات جدید"), new: true },
    { href: "/knowledge", label: tr("دانشنامه ابزار") },
    { href: "/about", label: tr("درباره کانوکس") },
    { href: "/contact", label: tr("تماس با ما") },
  ];
  if (pathname.startsWith("/print") || pathname.startsWith("/admin"))
    return null;
  return (
    <>
      <div className="utility-bar">
        <div className="container">
          <span>{tr("از انتخاب دقیق، تا اجرای حرفه‌ای.")}</span>
          <span dir="ltr">PRECISION IN EVERY DETAIL</span>
        </div>
      </div>
      <header className={`site-header ${compact ? "compact" : ""}`}>
        <div className="container header-main">
          <button
            className="icon-button mobile-menu-button"
            disabled={!ready}
            onClick={() => setMenu(true)}
            aria-label={tr("باز کردن منوی اصلی")}
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="brand-link">
            <Brandmark name={settings.englishName} persian={settings.name} />
          </Link>
          <button
            className="header-search"
            disabled={!ready}
            onClick={() => setSearch(true)}
          >
            <Search size={20} />
            <span>{tr("نام محصول، مدل یا کد فنی را جستجو کنید…")}</span>
            <kbd dir="ltr" aria-hidden="true">
              ⌘ K
            </kbd>
          </button>
          <div className="header-actions">
            <div className="header-preferences">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <Link
              className="icon-button header-compare"
              href="/compare"
              aria-label={tr("مقایسه، {v0} محصول", {
                v0: tr(fmtNumber(compare.length)),
              })}
            >
              <GitCompareArrows size={21} />
              {compare.length > 0 && (
                <span className="count-badge">{fmtNumber(compare.length)}</span>
              )}
            </Link>
            <Link
              className="icon-button header-wishlist"
              href="/wishlist"
              aria-label={tr("محصولات ذخیره‌شده، {v0} محصول", {
                v0: tr(fmtNumber(wishlist.length)),
              })}
            >
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span className="count-badge">
                  {fmtNumber(wishlist.length)}
                </span>
              )}
            </Link>
            <span className="header-divider" />
            <Link className="button primary header-quote" href="/quote">
              {tr("درخواست قیمت")}
              <ArrowUpLeft size={18} />
            </Link>
            <button
              className="icon-button mobile-search-button"
              disabled={!ready}
              onClick={() => setSearch(true)}
              aria-label={tr("جستجو")}
            >
              <Search size={24} />
            </button>
          </div>
        </div>
        <div className="header-nav-wrap">
          <nav className="container header-nav" aria-label={tr("منوی اصلی")}>
            <div className="nav-links">
              <div
                className="products-nav-item"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <button
                  className={`nav-link ${mega || pathname.startsWith("/products") ? "active" : ""}`}
                  aria-expanded={mega}
                  aria-controls="products-mega-menu"
                  disabled={!ready}
                  onClick={openMega}
                >
                  {tr("محصولات")}
                  <ChevronDown size={14} />
                </button>
              </div>
              {links.map((l) => (
                <Link
                  key={l.href}
                  className={`nav-link ${pathname.startsWith(l.href) ? "active" : ""}`}
                  href={l.href}
                >
                  {tr(l.label)}
                  {l.new && <span className="nav-new-dot" />}
                </Link>
              ))}
            </div>
            <Link className="header-consult" href="/quote?purpose=consultation">
              <MessageCircle size={17} />
              {tr("مشاوره انتخاب ابزار")}
              <ArrowUpLeft size={15} />
            </Link>
          </nav>
        </div>
        {mega && (
          <div
            className="mega-menu"
            id="products-mega-menu"
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <div className="container">
              <div className="mega-heading">
                <div>
                  <span className="eyebrow">{tr("کاتالوگ تخصصی کانوکس")}</span>
                  <h2>{tr("برای هر کار، ابزار مناسب.")}</h2>
                </div>
                <Link
                  className="text-link"
                  href="/products"
                  onClick={() => setMega(false)}
                >
                  {tr("همه محصولات")}
                  <ArrowLeft size={18} />
                </Link>
                <button
                  className="icon-button"
                  onClick={() => setMega(false)}
                  aria-label={tr("بستن فهرست محصولات")}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mega-grid">
                {main.map((c) => (
                  <Link
                    href={`/products/${c.slug}`}
                    className="mega-category"
                    key={c.id}
                    onClick={() => setMega(false)}
                  >
                    <ProductImage
                      src={c.image}
                      alt={tr(c.name)}
                      sizes="210px"
                    />
                    <span className="english-label" dir="ltr">
                      {tr(c.english)}
                    </span>
                    <h3>
                      {tr(c.name)}
                      <ArrowLeft size={17} />
                    </h3>
                    <p>{tr(c.description)}</p>
                    <span className="mega-count">
                      {fmtNumber(c.count || 0)}
                      {tr(" محصول")}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mega-bottom">
                <Link href="/products/accessories">
                  {tr("متعلقات و لوازم جانبی")}
                  <ArrowLeft size={16} />
                </Link>
                <span>
                  {tr("با نام مدل یا مشخصه فنی هم می‌توانید جستجو کنید.")}
                </span>
              </div>
            </div>
          </div>
        )}
      </header>
      {mega && (
        <button
          aria-label={tr("بستن منوی محصولات")}
          tabIndex={-1}
          className="mega-backdrop"
          onClick={() => setMega(false)}
        />
      )}
      <SearchDialog open={search} onClose={() => setSearch(false)} />
      <Modal
        open={menu}
        onClose={() => setMenu(false)}
        title={tr("دسترسی سریع")}
        className="mobile-nav-modal"
      >
        <div
          className="mobile-nav-body"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setMenu(false);
          }}
        >
          <Link href="/" onClick={() => setMenu(false)}>
            <Brandmark name={settings.englishName} persian={settings.name} />
          </Link>
          <button
            className="header-search mobile-full-search"
            onClick={() => {
              setMenu(false);
              setSearch(true);
            }}
          >
            <Search size={19} />
            {tr("جستجو در محصولات")}
          </button>
          <div className="mobile-preferences">
            <span>{tr("تنظیمات نمایش")}</span>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          <details open>
            <summary>
              {tr("محصولات")}
              <ChevronDown size={18} />
            </summary>
            <Link href="/products">
              {tr("همه محصولات")}
              <ArrowLeft size={16} />
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/products/${c.slug}`}>
                {tr(c.name)}
                <span>{fmtNumber(c.count || 0)}</span>
              </Link>
            ))}
          </details>
          {links.map((l) => (
            <Link className="mobile-nav-link" key={l.href} href={l.href}>
              {tr(l.label)}
              <ArrowLeft size={17} />
            </Link>
          ))}
          <Link className="mobile-nav-link" href="/wishlist">
            {tr("محصولات ذخیره‌شده")}
            <Heart size={18} />
          </Link>
          <Link className="mobile-nav-link" href="/compare">
            {tr("مقایسه محصولات")}
            <GitCompareArrows size={18} />
          </Link>
          <Link className="button primary full" href="/quote">
            {tr("درخواست قیمت")}
            <ArrowLeft size={18} />
          </Link>
        </div>
      </Modal>
    </>
  );
}
