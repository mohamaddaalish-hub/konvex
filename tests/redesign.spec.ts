import {
  test,
  expect,
  request as apiRequest,
  type Page,
} from "@playwright/test";
import fs from "node:fs";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const password = fs
  .readFileSync(".env.local", "utf8")
  .match(/^ADMIN_PASSWORD=(.+)$/m)![1];
const ready = (page: Page) => page.waitForSelector("html[data-kv-ready=true]");

test("Language navigation preserves URL state and browser document; themes persist", async ({
  page,
}) => {
  await page.goto("/products/laser-distance-meters?f.range=60+m&sort=name");
  await ready(page);
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(1);
  await page.evaluate(() => {
    (window as any).__konvexProbe = "same-document";
  });
  await page
    .locator(".header-preferences")
    .getByRole("link", { name: "تغییر زبان به انگلیسی" })
    .click();
  await expect(page).toHaveURL(
    /\/en\/products\/laser-distance-meters\?f.range=60\+m&sort=name/,
  );
  expect(await page.evaluate(() => (window as any).__konvexProbe)).toBe(
    "same-document",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Laser distance meters");
  await expect(page.locator(".catalog-main .product-card h3")).toContainText(
    "60 m",
  );
  await page
    .getByRole("button", { name: "Switch to dark mode", exact: true })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await ready(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .locator(".header-preferences")
    .getByRole("link", { name: "Switch to Persian" })
    .click();
  await expect(page).toHaveURL(
    /\/products\/laser-distance-meters\?f.range=60\+m&sort=name/,
  );
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("h1")).toHaveText("متر لیزری");
  await page.goto("/product/konvex-lm-60#specifications");
  await ready(page);
  await page
    .locator(".header-preferences")
    .getByRole("link", { name: "تغییر زبان به انگلیسی" })
    .click();
  await expect(page).toHaveURL(/\/en\/product\/konvex-lm-60#specifications$/);
  await expect(page.locator(".technical-table")).toContainText(
    "Measuring range",
  );
});

test("Quote draft and reference survive language switching without storing personal data in localStorage", async ({
  page,
}) => {
  await page.goto("/quote?product=laser-distance-meters-1");
  await ready(page);
  await page.getByLabel("نام و نام خانوادگی").fill("KONVEX QA Language");
  await page.getByLabel("شماره تماس", { exact: false }).fill("09000000000");
  await page
    .getByLabel("درباره نیازتان بیشتر بگویید")
    .fill("KONVEX_AUTOMATED_QA language draft");
  await page
    .getByRole("button", { name: /افزایش تعداد/ })
    .first()
    .click();
  await page.locator("input[name=preferredContact][value=email]").check();
  await page.locator("#quote-email").fill("qa@example.invalid");
  await page.locator("input[name=consent]").check();
  await page
    .locator(".header-preferences")
    .getByRole("link", { name: "تغییر زبان به انگلیسی" })
    .click();
  await expect(page).toHaveURL(/\/en\/quote\?product=laser-distance-meters-1/);
  await expect(page.getByLabel("Full name", { exact: false })).toHaveValue(
    "KONVEX QA Language",
  );
  await expect(page.getByLabel("Phone number", { exact: false })).toHaveValue(
    "09000000000",
  );
  await expect(page.locator("#quote-email")).toHaveValue("qa@example.invalid");
  await expect(
    page.getByLabel("Tell us more about your requirements"),
  ).toHaveValue("KONVEX_AUTOMATED_QA language draft");
  await expect(page.locator("input[name=consent]")).toBeChecked();
  await expect(
    page.locator('.quote-item input[inputmode="numeric"]'),
  ).toHaveValue("2");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "qa@example.invalid",
  );
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/api/quotes") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Submit request", exact: true })
    .click();
  expect((await response).status()).toBe(201);
  await expect(
    page.getByRole("heading", { name: "Your test request is saved." }),
  ).toBeVisible();
  const reference = await page.locator(".reference-box bdi").textContent();
  await page
    .locator(".header-preferences")
    .getByRole("link", { name: "Switch to Persian" })
    .click();
  await expect(page.locator(".reference-box bdi")).toHaveText(reference!);
  await expect(
    page.getByRole("heading", { name: "درخواست آزمایشی شما ثبت شد." }),
  ).toBeVisible();
});

test("English validation, search, filters and comparison retain the original behavior", async ({
  page,
}) => {
  await page.goto("/en/quote");
  await ready(page);
  await page
    .getByRole("button", { name: "Submit request", exact: true })
    .click();
  await expect(page.locator("#error-name")).toContainText("full name");
  await expect(page.locator("#error-phone")).toContainText("valid phone");
  await expect(page.locator("#error-consent")).toContainText("privacy");
  await page.goto("/en");
  await ready(page);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "What tool do you need?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("braked caster");
  await expect(dialog.locator(".search-result").first()).toContainText(
    "Braked swivel caster",
  );
  await dialog.getByRole("combobox").press("ArrowDown");
  await dialog.getByRole("combobox").press("Enter");
  await expect(page).toHaveURL(/\/en\/product\//);
  await expect(page.locator("h1")).toContainText("caster");
  await page.goto("/en/products/laser-distance-meters");
  const sidebar = page.locator(".catalog-sidebar");
  await sidebar
    .locator(".filter-option")
    .filter({ hasText: "60 m" })
    .getByRole("checkbox")
    .check();
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(6);
  const buttons = page.locator(".catalog-main .compare-button");
  await buttons.nth(0).click();
  await buttons.nth(1).click();
  await buttons.nth(2).click();
  await buttons.nth(3).click();
  await expect(page.getByRole("status")).toContainText("up to three");
  await page.goto("/en/compare");
  await ready(page);
  await expect(page.locator(".compare-product-head")).toHaveCount(3);
  await page.getByRole("checkbox", { name: "Differences only" }).check();
  await expect(page.locator(".comparison-table")).toContainText(
    "Measuring range",
  );
  await page
    .getByRole("link", { name: "Request a quote for this selection" })
    .click();
  await expect(page).toHaveURL(/\/en\/quote\?products=/);
  await expect(page.locator(".quote-item")).toHaveCount(3);
});

test("Calm particles respond gently to scroll, pause, resize and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en");
  await ready(page);
  const particles = page.locator("#ambient-particles");
  await expect(particles).toHaveAttribute("data-running", "true");
  const count = Number(await particles.getAttribute("data-count"));
  expect(count).toBeLessThanOrEqual(80);
  await page.evaluate(() => scrollTo(0, 700));
  await page.waitForTimeout(350);
  const speed = Number(await particles.getAttribute("data-speed"));
  expect(speed).toBeGreaterThan(1);
  expect(speed).toBeLessThanOrEqual(1.25);
  await page.getByRole("button", { name: "Pause background motion" }).click();
  await expect(particles).toHaveAttribute("data-running", "false");
  const paused = await particles.getAttribute("data-frames");
  await page.waitForTimeout(200);
  expect(await particles.getAttribute("data-frames")).toBe(paused);
  await page.getByRole("button", { name: "Enable background motion" }).click();
  await expect(particles).toHaveAttribute("data-running", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => Number(await particles.getAttribute("data-count")))
    .toBeLessThanOrEqual(32);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(particles).toHaveAttribute("data-running", "false");
  const frames = await particles.getAttribute("data-frames");
  await page.waitForTimeout(250);
  expect(await particles.getAttribute("data-frames")).toBe(frames);
});

test("English keyboard tabs move in LTR order", async ({ page }) => {
  await page.goto("/en");
  await ready(page);
  const tabs = page.locator(".collection-tabs").getByRole("tab");
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  const appTabs = page.locator(".application-tabs").getByRole("tab");
  await appTabs.nth(0).click();
  await appTabs.nth(0).press("ArrowRight");
  await expect(appTabs.nth(1)).toHaveAttribute("aria-selected", "true");
});

test("Translations are editable, searchable and never overwrite Persian or technical data", async ({
  page,
}) => {
  const api = await apiRequest.newContext({ baseURL: base });
  const { token } = await (await api.get("/api/csrf")).json();
  const headers = {
    origin: base,
    "x-csrf-token": token,
    "x-konvex-locale": "en",
    "x-forwarded-for": "198.51.100.249",
  };
  expect(
    (
      await api.post("/api/admin/login", { headers, data: { password } })
    ).status(),
  ).toBe(200);
  const original = (
    await (
      await api.get("/api/admin/products?id=laser-distance-meters-1")
    ).json()
  ).product;
  const p = {
    ...original,
    id: "kv-automated-qa-redesign",
    slug: "kv-automated-qa-redesign",
    sku: "KV-REDESIGN-QA",
    model: "KV-I18N-QA",
    name: "محصول آزمون دوزبانه",
    featured: false,
    isNew: false,
    relatedProductIds: [],
    compatibleProductIds: [],
    accessoryIds: [],
    images: [
      original.images[0],
      original.images[1],
      { url: "/images/hero.webp", alt: "تصویر مرجع خانواده محصول" },
    ],
  };
  try {
    expect(
      (await api.post("/api/admin/products", { headers, data: p })).status(),
    ).toBe(200);
    const before = (
      await (await api.get("/api/admin/products?id=" + p.id)).json()
    ).product;
    const info = await (
      await api.get("/api/admin/translations?type=product&id=" + p.id)
    ).json();
    const fields = Object.fromEntries(
      Object.keys(info.source).map((k) => [k, "Sample English copy for " + k]),
    );
    fields.name = "Bilingual verification tool";
    expect(
      (
        await api.post("/api/admin/translations", {
          headers,
          data: { type: "product", id: p.id, fields },
        })
      ).status(),
    ).toBe(200);
    const after = (
      await (await api.get("/api/admin/products?id=" + p.id)).json()
    ).product;
    expect(after).toEqual(before);
    await page.goto("/en");
    await ready(page);
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "What tool do you need?" });
    await dialog.getByRole("combobox").fill("bilingual verification");
    await expect(dialog.locator(".search-result")).toHaveCount(1);
    await expect(dialog.locator(".search-result")).toContainText(
      "Bilingual verification tool",
    );
    await dialog.locator(".search-result").click();
    await expect(page.locator("h1")).toHaveText("Bilingual verification tool");
    await page
      .locator(".product-secondary-actions")
      .getByRole("button", { name: /^Save product:/ })
      .click();
    await page.goto("/en/wishlist");
    await ready(page);
    await expect(page.locator(".product-card h3")).toHaveText(
      "Bilingual verification tool",
    );
    await page.reload();
    await ready(page);
    await expect(page.locator(".product-card h3")).toHaveText(
      "Bilingual verification tool",
    );
    await page.goto("/en/product/" + p.slug);
    await page.getByRole("button", { name: /Enlarge image/ }).click();
    await expect(page.locator(".gallery-modal")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".gallery-fullscreen img")).toHaveAttribute(
      "src",
      /measurement/,
    );
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".gallery-fullscreen img")).toHaveAttribute(
      "src",
      "/images/green/hero.webp",
    );
    await page.keyboard.press("Escape");
    await page.context().addCookies((await api.storageState()).cookies);
    await page.goto("/en/admin?tab=translations");
    await ready(page);
    await page.getByLabel("Search translation content").fill("KV-I18N-QA");
    await page.getByRole("row").filter({hasText: "KV-I18N-QA"}).getByRole("button", {name: "Edit translation", exact: true}).click();
    const editor = page.getByRole("dialog", {
      name: "Edit English translation",
    });
    await expect(editor).toBeVisible();
    await editor
      .getByLabel("English translation — name", { exact: true })
      .fill("Updated bilingual verification tool");
    await editor
      .getByRole("button", { name: "Save translation", exact: true })
      .click();
    await expect(editor).not.toBeVisible();
    await page.goto("/en/product/" + p.slug);
    await expect(page.locator("h1")).toHaveText(
      "Updated bilingual verification tool",
    );
    expect(
      (await (await api.get("/api/admin/products?id=" + p.id)).json()).product,
    ).toEqual(before);
  } finally {
    await api.delete("/api/admin/products", { headers, data: { id: p.id } });
    await api.dispose();
  }
});

test("Localized SEO, files and genuine 404s preserve canonical route contracts", async ({
  page,
  request,
}) => {
  await page.goto("/en/product/konvex-lm-60");
  expect(await page.title()).toContain("Laser distance");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    "https://konvex.example/en/product/konvex-lm-60",
  );
  await expect(page.locator("link[hreflang=fa]")).toHaveAttribute(
    "href",
    "https://konvex.example/product/konvex-lm-60",
  );
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const product = schemas
    .map((v) => JSON.parse(v))
    .find((v) => v["@type"] === "Product");
  expect(product.name).toBe("Laser distance meter · 60 m");
  expect(product.url).toContain("/en/product/");
  const sheet = await request.get(
    "/api/products/laser-distance-meters-1/datasheet?locale=en",
  );
  expect(sheet.status()).toBe(200);
  expect(await sheet.text()).toContain('lang="en" dir="ltr"');
  expect(await sheet.text()).toContain("Measuring range");
  for (const path of [
    "/en/no-such-page",
    "/en/product/not-real",
    "/en/products/not-real",
    "/product/not-real",
    "/.env.local",
    "/private/admin-access.txt",
  ])
    expect((await request.get(path)).status(), path).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/en/product/konvex-lm-60");
  expect(sitemap).toContain('hreflang="fa"');
});
