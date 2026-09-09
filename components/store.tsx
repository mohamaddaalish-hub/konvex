"use client";
import { usePreferences } from "./preferences";
import { messageKey, type Dictionary } from "@/i18n/core";
import { useI18n } from "@/i18n/use-i18n";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Link from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  Check,
  X,
  ArrowLeft,
  GitCompareArrows,
  Heart,
  Eye,
  Trash2,
} from "lucide-react";
import type { ProductSummary, Category } from "@/lib/types";
import { faNumber, isTechnical } from "@/lib/format";
import { track } from "@/lib/analytics";
import { Modal } from "./modal";
import { ProductImage } from "./ui";
type Store = {
  wishlist: ProductSummary[];
  compare: ProductSummary[];
  recent: ProductSummary[];
  ready: boolean;
  toggleWishlist: (p: ProductSummary) => void;
  toggleCompare: (p: ProductSummary) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  addRecent: (p: ProductSummary) => void;
  toast: (message: string) => void;
  quickView: (p: ProductSummary) => void;
};
const Context = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Context);
  if (!s) throw new Error("StoreProvider missing");
  return s;
};
const read = (key: string): ProductSummary[] => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data)
      ? data
          .filter(
            (v) =>
              v &&
              typeof v.id === "string" &&
              Array.isArray(v.images) &&
              Array.isArray(v.specifications),
          )
          .slice(0, 100)
      : [];
  } catch {
    return [];
  }
};
export function StoreProvider({
  children,
  categories,
}: {
  children: ReactNode;
  categories: Category[];
}) {
  const {
    t: tr,
    locale,
    dictionary,
    n: fmtNumber,
    path: localizedPath,
  } = useI18n();
  const { mergeDictionary } = usePreferences();
  const [wishlist, setWishlist] = useState<ProductSummary[]>([]),
    [compare, setCompare] = useState<ProductSummary[]>([]),
    [recent, setRecent] = useState<ProductSummary[]>([]),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [quick, setQuick] = useState<ProductSummary | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    const wished = read("kv-wishlist"),
      compared = read("kv-compare").slice(0, 3),
      viewed = read("kv-recent").slice(0, 8);
    setWishlist(wished);
    const saved = [...wished, ...compared, ...viewed];
    for (const p of saved)
      if (p.displayDictionary) mergeDictionary(p.displayDictionary);
    const ids = [...new Set(saved.map((p) => p.id))];
    if (ids.length) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      fetch("/api/selections?ids=" + encodeURIComponent(ids.join(",")), {
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.dictionary) mergeDictionary(d.dictionary);
        })
        .catch(() => {})
        .finally(() => clearTimeout(timer));
    }
    setCompare(read("kv-compare").slice(0, 3));
    setRecent(read("kv-recent").slice(0, 8));
    setReady(true);
    document.documentElement.dataset.kvReady = "true";
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("kv-wishlist", JSON.stringify(wishlist));
        localStorage.setItem("kv-compare", JSON.stringify(compare));
        localStorage.setItem("kv-recent", JSON.stringify(recent));
      } catch {}
    }
  }, [wishlist, compare, recent, ready]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(t);
  }, [message]);
  useEffect(() => {
    setQuick(null);
  }, [pathname]);
  const toast = useCallback((text: string) => {
    setMessage(text);
  }, []);
  const remember = (p: ProductSummary) => {
    const displayDictionary: Dictionary = {};
    const visit = (v: unknown) => {
      if (typeof v === "string") {
        const key = messageKey(v);
        if (dictionary[key]) displayDictionary[key] = dictionary[key];
      } else if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === "object")
        Object.entries(v)
          .filter(([key]) => key !== "displayDictionary")
          .forEach(([, value]) => visit(value));
    };
    visit(p);
    return { ...p, displayDictionary };
  };
  const toggleWishlist = (p: ProductSummary) => {
    p = remember(p);
    const exists = wishlist.some((v) => v.id === p.id);
    setWishlist(
      exists
        ? wishlist.filter((v) => v.id !== p.id)
        : [p, ...wishlist].slice(0, 100),
    );
    toast(
      exists
        ? tr("محصول از ذخیره‌شده‌ها حذف شد.")
        : tr("محصول در فهرست شما ذخیره شد."),
    );
    if (!exists) track("add_to_wishlist", { product_id: p.id });
  };
  const toggleCompare = (p: ProductSummary) => {
    p = remember(p);
    if (compare.some((v) => v.id === p.id)) {
      setCompare(compare.filter((v) => v.id !== p.id));
      toast(tr("محصول از مقایسه حذف شد."));
      return;
    }
    if (compare.length && compare[0].categoryId !== p.categoryId) {
      toast(
        tr(
          "برای مقایسه دقیق، محصولات یک دسته را انتخاب کنید. ابتدا مقایسه فعلی را پاک کنید.",
        ),
      );
      return;
    }
    if (compare.length === 3) {
      toast(tr("حداکثر سه محصول قابل مقایسه است. ابتدا یکی را حذف کنید."));
      return;
    }
    setCompare([...compare, p]);
    track("compare_product", { product_id: p.id });
    toast(tr("محصول به مقایسه اضافه شد."));
  };
  const addRecent = useCallback((p: ProductSummary) => {
    setRecent((items) =>
      [p, ...items.filter((x) => x.id !== p.id)].slice(0, 8),
    );
  }, []);
  const removeCompare = (id: string) =>
    setCompare((prev) => prev.filter((v) => v.id !== id));
  const value: Store = {
    wishlist,
    compare,
    recent,
    ready,
    toggleWishlist,
    toggleCompare,
    removeCompare,
    clearCompare: () => setCompare([]),
    addRecent,
    toast,
    quickView: setQuick,
  };
  const category = categories.find((c) => c.id === compare[0]?.categoryId);
  return (
    <Context.Provider value={value}>
      {children}
      {compare.length > 0 &&
        pathname !== "/compare" &&
        !pathname.startsWith("/admin") &&
        !pathname.startsWith("/print") && (
          <aside
            className="compare-bar"
            aria-label={tr("محصولات منتخب برای مقایسه")}
          >
            <div className="compare-bar-label">
              <GitCompareArrows size={22} />
              <span>
                {tr("مقایسه محصولات ")}
                <b>
                  {fmtNumber(compare.length)}
                  {tr(" از ۳")}
                </b>
              </span>
            </div>
            <div className="compare-bar-items">
              {compare.map((p) => (
                <div key={p.id} className="compare-mini">
                  <ProductImage
                    src={p.images[0]?.url || "/images/hero.webp"}
                    alt={tr(p.name)}
                    sizes="48px"
                  />
                  <span dir="ltr">{tr(p.model)}</span>
                  <button
                    onClick={() => removeCompare(p.id)}
                    className="icon-button"
                    aria-label={tr("حذف {v0} از مقایسه", { v0: tr(p.name) })}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <Link
              className="button primary small"
              href={
                compare.length > 1
                  ? "/compare"
                  : `/products/${category?.slug || ""}`
              }
            >
              {tr(
                compare.length > 1
                  ? tr("مقایسه مشخصات")
                  : tr("انتخاب محصول دوم"),
              )}
              <ArrowLeft size={17} />
            </Link>
            <button
              className="icon-button compare-clear"
              aria-label={tr("پاک کردن مقایسه")}
              onClick={() => setCompare([])}
            >
              <Trash2 size={18} />
            </button>
          </aside>
        )}
      <div
        className={`toast ${message ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message && (
          <>
            <Check size={19} />
            <p>{tr(message)}</p>
            <button
              className="icon-button"
              onClick={() => setMessage("")}
              aria-label={tr("بستن پیام")}
            >
              <X size={17} />
            </button>
          </>
        )}
      </div>
      <Modal
        open={!!quick}
        onClose={() => setQuick(null)}
        title={tr("نگاه نزدیک‌تر")}
        className="quick-modal"
      >
        {quick && (
          <div className="quick-content">
            <ProductImage
              src={quick.images[0]?.url || "/images/hero.webp"}
              alt={tr(quick.name)}
            />
            <div>
              <span className="product-brand">{tr(quick.brand)}</span>
              <h3>{tr(quick.name)}</h3>
              <p className="model" dir="ltr">
                {tr(quick.model)}
              </p>
              <p>{tr(quick.shortDescription)}</p>
              <dl className="quick-specs">
                {quick.specifications
                  .filter((s) => s.highlight)
                  .slice(0, 3)
                  .map((s) => (
                    <div key={s.key}>
                      <dt>{tr(s.label)}</dt>
                      <dd
                        dir={
                          locale === "en" || isTechnical(s.value)
                            ? "ltr"
                            : "rtl"
                        }
                      >
                        {tr(s.value)}
                      </dd>
                    </div>
                  ))}
              </dl>
              {quick.isSample && (
                <p className="small muted">
                  {tr("اطلاعات و تصویر این محصول نمونه است.")}
                </p>
              )}
              <Link
                className="button primary full"
                href={`/product/${quick.slug}`}
                onClick={() => setQuick(null)}
              >
                {tr("مشاهده کامل محصول")}
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </Context.Provider>
  );
}
export function WishlistButton({
  product,
  label = false,
}: {
  product: ProductSummary;
  label?: boolean;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const s = useStore(),
    active = s.wishlist.some((p) => p.id === product.id);
  return (
    <button
      type="button"
      className={
        label
          ? "button secondary"
          : `icon-button wishlist-button ${active ? "active" : ""}`
      }
      aria-label={tr(
        label
          ? active
            ? tr("ذخیره شده؛ حذف {v0} از فهرست", { v0: tr(product.name) })
            : tr("ذخیره محصول: {v0}", { v0: tr(product.name) })
          : active
            ? tr("حذف {v0} از ذخیره‌شده‌ها", { v0: tr(product.name) })
            : tr("ذخیره {v0}", { v0: tr(product.name) }),
      )}
      aria-pressed={active}
      disabled={!s.ready}
      onClick={() => s.toggleWishlist(product)}
    >
      <Heart size={19} fill={active ? "currentColor" : "none"} />
      {label && (active ? tr("ذخیره شده") : tr("ذخیره محصول"))}
    </button>
  );
}
export function CompareButton({
  product,
  compact = false,
}: {
  product: ProductSummary;
  compact?: boolean;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const s = useStore(),
    active = s.compare.some((p) => p.id === product.id);
  return (
    <button
      type="button"
      className={`compare-button ${active ? "selected" : ""} ${compact ? "compact" : ""}`}
      aria-pressed={active}
      disabled={!s.ready}
      onClick={() => s.toggleCompare(product)}
      aria-label={tr("{v0} مقایسه: {v1}", {
        v0: tr(active ? tr("حذف از") : tr("افزودن به")),
        v1: tr(product.name),
      })}
    >
      <span className="compare-checkbox">{active && <Check size={12} />}</span>
      <span className="compare-label">{tr("مقایسه")}</span>
      <GitCompareArrows
        className="compare-mobile-icon"
        size={18}
        aria-hidden="true"
      />
    </button>
  );
}
export function QuickViewButton({ product }: { product: ProductSummary }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const s = useStore();
  return (
    <button
      type="button"
      className="quick-view-button"
      onClick={() => s.quickView(product)}
      aria-label={tr("مشاهده سریع {v0}", { v0: tr(product.name) })}
    >
      <Eye size={17} />
      <span>{tr("مشاهده سریع")}</span>
    </button>
  );
}
export function ProductViewTracker({ product }: { product: ProductSummary }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const { addRecent, ready } = useStore();
  useEffect(() => {
    if (ready) {
      addRecent(product);
      track("product_view", {
        product_id: product.id,
        category: product.categoryId,
      });
    }
  }, [product.id, ready, addRecent]);
  return null;
}
