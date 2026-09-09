"use client";
import {
  createContext,
  useCallback,
  useMemo,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import {
  usePathname as useNextPathname,
  useSearchParams,
} from "next/navigation";
import NextLink from "next/link";
import { Sun, Moon, Pause, Play } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { useI18n } from "@/i18n/use-i18n";
import { localePath, type Locale, type Dictionary } from "@/i18n/core";
type Theme = "light" | "dark";
type PreferenceContext = {
  mergeDictionary: (dictionary: Dictionary) => void;
  theme: Theme;
  toggleTheme: () => void;
  motionPaused: boolean;
  toggleMotion: () => void;
  reducedMotion: boolean;
  ready: boolean;
  quoteDraft: React.RefObject<unknown>;
};
const Preferences = createContext<PreferenceContext | null>(null);
export function usePreferences() {
  const value = useContext(Preferences);
  if (!value) throw new Error("Preferences provider is missing");
  return value;
}
export function AppProviders({
  children,
  locale: initialLocale,
  messages,
}: {
  children: ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
}) {
  const pathname = useNextPathname();
  const locale: Locale = pathname
    ? /^\/en(?:\/|$)/.test(pathname)
      ? "en"
      : "fa"
    : initialLocale;
  const [theme, setTheme] = useState<Theme>("light"),
    [ready, setReady] = useState(false),
    [motionPaused, setPaused] = useState(false),
    [reducedMotion, setReduced] = useState(false);
  const quoteDraft = useRef<unknown>(null);
  const [extraDictionary, setExtraDictionary] = useState<Dictionary>({});
  const baseDictionary = useRef(messages.dictionary as Dictionary);
  baseDictionary.current = messages.dictionary as Dictionary;
  const mergeDictionary = useCallback((next: Dictionary) => {
    setExtraDictionary((previous) => {
      const updates = Object.entries(next).filter(
        ([key, value]) =>
          (previous[key] ?? baseDictionary.current[key]) !== value,
      );
      if (!updates.length) return previous;
      const map = new Map(Object.entries(previous));
      for (const [key, value] of updates) {
        map.delete(key);
        map.set(key, value);
      }
      const entries = [...map.entries()];
      return Object.fromEntries(entries.slice(-6500));
    });
  }, []);
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
    document.documentElement.dataset.locale = locale;
  }, [locale]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const system = matchMedia("(prefers-color-scheme: dark)");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("kv-theme");
      setPaused(localStorage.getItem("kv-motion") === "paused");
    } catch {}
    setTheme(
      (saved === "dark" || saved === "light"
        ? saved
        : system.matches
          ? "dark"
          : "light") as Theme,
    );
    setReduced(media.matches);
    setReady(true);
    const reduce = () => setReduced(media.matches);
    const change = () => {
      try {
        if (!localStorage.getItem("kv-theme"))
          setTheme(system.matches ? "dark" : "light");
      } catch {}
    };
    media.addEventListener("change", reduce);
    system.addEventListener("change", change);
    return () => {
      media.removeEventListener("change", reduce);
      system.removeEventListener("change", change);
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) =>
        m.setAttribute("content", theme === "dark" ? "#101815" : "#f2f5f3"),
      );
  }, [theme, ready]);
  useEffect(() => {
    document.documentElement.dataset.motion =
      motionPaused || reducedMotion ? "reduced" : "full";
  }, [motionPaused, reducedMotion]);
  function toggleTheme() {
    const value = theme === "dark" ? "light" : "dark";
    setTheme(value);
    try {
      localStorage.setItem("kv-theme", value);
    } catch {}
  }
  function toggleMotion() {
    setPaused((p) => {
      try {
        localStorage.setItem("kv-motion", !p ? "paused" : "enabled");
      } catch {}
      return !p;
    });
  }
  const mergedMessages = useMemo(
    () => ({
      ...messages,
      dictionary: {
        ...(messages.dictionary as Dictionary),
        ...extraDictionary,
      },
    }),
    [messages, extraDictionary],
  );
  const preferences = useMemo(
    () => ({
      mergeDictionary,
      theme,
      toggleTheme,
      motionPaused,
      toggleMotion,
      reducedMotion,
      ready,
      quoteDraft,
    }),
    [mergeDictionary, theme, motionPaused, reducedMotion, ready],
  );
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={mergedMessages}
      timeZone="Asia/Tehran"
    >
      <Preferences.Provider value={preferences}>
        {children}
      </Preferences.Provider>
    </NextIntlClientProvider>
  );
}
export function ThemeSwitcher() {
  const { theme, toggleTheme, ready } = usePreferences();
  const { t } = useI18n();
  return (
    <button
      className="icon-button theme-switch"
      type="button"
      disabled={!ready}
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? t("تغییر به حالت روشن") : t("تغییر به حالت تیره")
      }
      title={theme === "dark" ? t("حالت روشن") : t("حالت تیره")}
    >
      <Sun className="theme-sun" size={19} />
      <Moon className="theme-moon" size={19} />
    </button>
  );
}
export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const params = useSearchParams();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);
  return (
    <nav className="language-switch" aria-label={t("زبان وب‌سایت")}>
      {(["fa", "en"] as const).map((lang, index) => (
        <span className="language-option" key={lang}>
          {index === 1 && (
            <span className="language-separator" aria-hidden="true" />
          )}
          <NextLink
            prefetch={false}
            scroll={false}
            href={
              localePath(pathname, lang) +
              (params.size ? "?" + params.toString() : "") +
              hash
            }
            lang={lang}
            hrefLang={lang}
            aria-current={lang === locale ? "page" : undefined}
            aria-label={
              (lang === "en"
                ? t("تغییر زبان به انگلیسی")
                : t("تغییر زبان به فارسی")) +
              " (" +
              lang.toUpperCase() +
              ")"
            }
            onClick={(e) => {
              if (lang === locale) e.preventDefault();
              else window.dispatchEvent(new Event("kv:before-language-change"));
            }}
          >
            {lang.toUpperCase()}
          </NextLink>
        </span>
      ))}
    </nav>
  );
}
export function MotionSwitcher() {
  const { motionPaused, toggleMotion, reducedMotion, ready } = usePreferences();
  const { t } = useI18n();
  return (
    <button
      type="button"
      className="motion-switch"
      onClick={toggleMotion}
      disabled={!ready || reducedMotion}
      aria-pressed={motionPaused || reducedMotion}
    >
      {motionPaused || reducedMotion ? <Play size={14} /> : <Pause size={14} />}
      <span>
        {reducedMotion
          ? t("حرکت کاهش‌یافته")
          : motionPaused
            ? t("فعال‌سازی حرکت پس‌زمینه")
            : t("مکث حرکت پس‌زمینه")}
      </span>
    </button>
  );
}
