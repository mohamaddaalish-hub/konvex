import type { Metadata, Viewport } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { getCategories, getSettings } from "@/lib/catalog";
import { siteUrl } from "@/lib/seo";
import { localizedMetadata } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import type { Locale } from "@/i18n/core";
import { StoreProvider } from "@/components/store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppProviders } from "@/components/preferences";
import { AmbientBackground } from "@/components/ambient-background";
import "./globals.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const common = await localizedMetadata(
    "کانوکس | ابزارِ کارِ حرفه‌ای",
    "کاتالوگ تخصصی ابزار و تجهیزات صنعتی کانوکس. مشخصات فنی، مقایسه محصولات و درخواست قیمت.",
    "/",
  );
  return {
    ...common,
    metadataBase: new URL(siteUrl),
    title: {
      default: t("کانوکس | ابزارِ کارِ حرفه‌ای"),
      template: locale === "en" ? "%s | KONVEX" : "%s | کانوکس",
    },
    description: t(
      "کاتالوگ تخصصی ابزار و تجهیزات صنعتی کانوکس. مشخصات فنی، مقایسه محصولات و درخواست قیمت.",
    ),
    icons: { icon: "/favicon.svg" },
    applicationName: "KONVEX",
    formatDetection: { telephone: false },
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f3" },
    { media: "(prefers-color-scheme: dark)", color: "#101815" },
  ],
};
const bootstrap = `try{var t=localStorage.getItem('kv-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;document.documentElement.dataset.motion=(matchMedia('(prefers-reduced-motion:reduce)').matches||localStorage.getItem('kv-motion')==='paused')?'reduced':'full';}catch(e){}`;
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale,
    messages = await getMessages(),
    { t } = await getI18n();
  const categories = getCategories(),
    settings = getSettings();
  return (
    <html
      lang={locale}
      dir={locale === "en" ? "ltr" : "rtl"}
      data-locale={locale}
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
        <link
          rel="preload"
          href={
            locale === "en"
              ? "/fonts/Inter-latin.woff2"
              : "/fonts/Vazirmatn-ui.woff2"
          }
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AppProviders locale={locale} messages={messages}>
          <AmbientBackground />
          <a className="skip-link" href="#main-content">
            {t("رفتن به محتوای اصلی")}
          </a>
          <StoreProvider categories={categories}>
            <Header
              categories={categories.filter((c) => !c.parentId)}
              settings={settings}
            />
            <main id="main-content">{children}</main>
            <Footer
              categories={categories.filter((c) => !c.parentId)}
              settings={settings}
            />
          </StoreProvider>
        </AppProviders>
      </body>
    </html>
  );
}
