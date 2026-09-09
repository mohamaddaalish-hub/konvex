import { chromium } from "playwright";
import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import Database from "better-sqlite3";
import fs from "node:fs";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const db = new Database(process.env.DATABASE_PATH || "data/konvex.sqlite", {
  readonly: true,
});
const products = db
  .prepare("SELECT data FROM products")
  .all()
  .map((r) => JSON.parse(r.data));
db.close();
const productsByFamily = [
  ...new Map(products.map((p) => [p.categoryId, p])).values(),
];
const routes = [
  "/",
  "/products",
  "/products/industrial-casters",
  "/applications",
  "/applications/construction",
  "/brands",
  "/about",
  "/knowledge",
  "/knowledge/laser-distance-meter-buying-guide",
  "/privacy",
  "/terms",
  "/wishlist",
  "/compare",
  ...productsByFamily.map((p) => "/product/" + p.slug),
];
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const report = [];
try {
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 940 },
    });
    const page = await context.newPage();
    let errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of routes) {
      errors = [];
      const response = await page.goto(base + route, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("html[data-kv-ready=true]");
      const badImages = await page
        .locator("main img")
        .evaluateAll(async (images) => {
          for (const image of images) {
            image.loading = "eager";
            try {
              await image.decode();
            } catch {}
          }
          return images
            .filter(
              (i) =>
                i.offsetParent !== null && (!i.complete || !i.naturalWidth),
            )
            .map((i) => i.currentSrc || i.src);
        });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      let violations = [];
      if (width !== 768) {
        const a = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        violations = a.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        }));
      }
      report.push({
        route,
        width,
        status: response.status(),
        overflow,
        badImages,
        pageErrors: [...errors],
        violations,
      });
      if (
        response.status() !== 200 ||
        overflow ||
        badImages.length ||
        errors.length ||
        violations.length
      )
        console.log("ISSUE", JSON.stringify(report.at(-1)));
    }
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.locator("main img").evaluateAll(async (imgs) => {
    await Promise.all(
      imgs.map(async (i) => {
        i.loading = "eager";
        try {
          await i.decode();
        } catch {}
      }),
    );
  });
  await page.screenshot({
    path: "docs/qa/final-home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/qa/final-home-mobile.png",
    fullPage: true,
  });
  // Populated mobile comparison and both sticky product actions together.
  const compare = products
    .filter((p) => p.categoryId === "laser-distance-meters")
    .slice(0, 3);
  await page.evaluate(
    (p) => localStorage.setItem("kv-compare", JSON.stringify(p)),
    compare,
  );
  await page.goto(base + "/compare", { waitUntil: "domcontentloaded" });
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  report.push({
    route: "/compare [3 items]",
    width: 390,
    status: 200,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    violations: axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await page.screenshot({
    path: "docs/qa/final-compare-mobile.png",
    fullPage: true,
  });
  await page.goto(base + "/product/konvex-lm-60", {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#specifications").scrollIntoViewIfNeeded();
  await expect(page.locator(".product-tabs a.active")).toHaveAttribute(
    "href",
    "#specifications",
  );
  await page.screenshot({ path: "docs/qa/final-sticky-actions-mobile.png" });
  // A genuine response, including paths that must never expose private files.
  for (const route of [
    "/not-a-route",
    "/product/not-a-product",
    "/products/not-a-category",
    "/applications/not-an-application",
    "/knowledge/not-an-article",
    "/.env.local",
    "/data/konvex.sqlite",
    "/private/admin-access.txt",
  ]) {
    const r = await context.request.get(base + route);
    report.push({ route, status: r.status(), expected: 404 });
  }
  // Authenticated management views and all four editor panels.
  const password = fs
    .readFileSync(".env.local", "utf8")
    .match(/^ADMIN_PASSWORD=(.+)$/m)[1];
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/admin", { waitUntil: "domcontentloaded" });
  await page.getByLabel("رمز مدیریت").fill(password);
  await page.getByRole("button", { name: "ورود به مدیریت" }).click();
  await expect(page.locator(".admin-shell")).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + "/admin", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".admin-shell")).toBeVisible();
    const check = async (name) => {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const item = {
        route: name,
        width,
        status: 200,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        violations: result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      };
      report.push(item);
      if (item.overflow || item.violations.length)
        console.log("ISSUE", JSON.stringify(item));
    };
    await check("/admin [authenticated]");
    await page.screenshot({
      path: `docs/qa/final-admin-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: /^ویرایش / })
      .first()
      .click();
    await expect(page.locator(".admin-editor-modal")).toBeVisible();
    const tabs = page.locator(".admin-editor-modal").getByRole("tab");
    for (let i = 0; i < (await tabs.count()); i++) {
      await tabs.nth(i).click();
      await check("/admin [product editor tab " + i + "]");
    }
    await page.keyboard.press("Escape");
    await page.goto(base + "/admin?tab=settings", {
      waitUntil: "domcontentloaded",
    });
    await check("/admin [settings]");
  }
  await page.getByRole("button", { name: "خروج از مدیریت" }).click();
  await context.close();
} finally {
  await browser.close();
  fs.writeFileSync(
    "docs/qa/expanded-review.json",
    JSON.stringify(report, null, 2),
  );
  console.log("Expanded cases:", report.length);
}
