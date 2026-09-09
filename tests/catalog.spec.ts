import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const samplePhone = "09000000000";
const password = fs
  .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
  .match(/^ADMIN_PASSWORD=(.+)$/m)![1];
const apiOrigin = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});

test("Desktop: visual navigation and category discovery", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("دقت در انتخاب");
  await page.locator(".products-nav-item button").click();
  await expect(page.locator("#products-mega-menu")).toBeVisible();
  await page
    .locator(".mega-category")
    .filter({
      has: page.getByRole("heading", { name: "متر لیزری", exact: true }),
    })
    .click();
  await expect(page).toHaveURL(/\/products\/laser-distance-meters/);
  await expect(page.locator("h1")).toHaveText("متر لیزری");
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(6);
});

test("Search: Persian digits, model, units, no results and keyboard autocomplete", async ({
  page,
  request,
}) => {
  for (const query of ["KV-LM60", "۶۰ متر", "60m", "۱۲۵ میلیمتر", "SDS Max"]) {
    const r = await request.get("/api/search?q=" + encodeURIComponent(query));
    expect(r.status()).toBe(200);
    const d = await r.json();
    expect(d.total, query).toBeGreaterThan(0);
  }
  const empty = await request.get("/api/search?q=zzzznotarealtool999");
  const d = await empty.json();
  expect(d.total).toBe(0);
  expect(d.suggested.length).toBeGreaterThan(0);
  await page.goto("/");
  await page.waitForSelector("html[data-kv-ready=true]");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "چه ابزاری نیاز دارید؟" });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("combobox");
  await input.fill("KV-LM60");
  await expect(dialog.locator(".search-result")).toHaveCount(1);
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/product\/konvex-lm-60/);
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.goto("/search?q=zzzznotarealtool999");
  await expect(
    page.getByRole("heading", { name: "محصول موردنظر پیدا نشد." }),
  ).toBeVisible();
  await expect(page.locator(".search-related .product-card")).toHaveCount(3);
});

test("Filters: category-specific, OR/AND logic, URL state, clear and pagination", async ({
  page,
}) => {
  await page.goto("/products/laser-distance-meters");
  const sidebar = page.locator(".catalog-sidebar");
  await sidebar
    .locator(".filter-option")
    .filter({ hasText: "60 m" })
    .getByRole("checkbox")
    .check();
  await expect(page).toHaveURL(/f.range=60\+m/);
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(1);
  await sidebar
    .locator(".filter-option")
    .filter({ hasText: "80 m" })
    .getByRole("checkbox")
    .check();
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(2);
  await sidebar
    .locator(".filter-group")
    .filter({ hasText: "درجه حفاظت" })
    .locator("summary")
    .click();
  await sidebar
    .locator(".filter-option")
    .filter({ hasText: "IP54" })
    .getByRole("checkbox")
    .check();
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(1);
  await expect(page.locator(".active-filter")).toHaveCount(3);
  await page.getByRole("button", { name: "حذف همه", exact: true }).click();
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(6);
  await page.goto("/products/industrial-casters");
  await expect(page.locator(".catalog-sidebar")).toContainText("ظرفیت هر چرخ");
  await expect(page.locator(".catalog-sidebar")).not.toContainText(
    "برد اندازه‌گیری",
  );
  await page.goto("/products");
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(12);
  const first = await page
    .locator(".catalog-main .product-meta .model")
    .allTextContents();
  await page
    .locator(".pagination")
    .getByRole("link", { name: "بعدی", exact: true })
    .click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(12);
  const second = await page
    .locator(".catalog-main .product-meta .model")
    .allTextContents();
  expect(first.filter((v) => second.includes(v))).toEqual([]);
});

test("Product gallery, wishlist persistence, same-category comparison and limits", async ({
  page,
}) => {
  await page.goto("/product/konvex-lm-60");
  await expect(page.locator(".technical-table")).toContainText("60 m");
  await page.getByRole("button", { name: /بزرگ‌نمایی تصویر/ }).click();
  const zoom = page.locator(".gallery-modal");
  await expect(zoom).toBeVisible();
  await zoom.getByRole("button", { name: "بزرگ‌نمایی", exact: true }).click();
  await expect(zoom.locator(".gallery-fullscreen")).toHaveClass(/zoomed/);
  await page.keyboard.press("ArrowLeft");
  await expect(zoom.locator(".gallery-fullscreen")).not.toHaveClass(/zoomed/);
  await page.keyboard.press("Escape");
  await expect(zoom).not.toBeVisible();
  await page
    .locator(".product-secondary-actions")
    .getByRole("button", { name: /^ذخیره محصول/ })
    .click();
  await page.goto("/wishlist");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.goto("/products/laser-distance-meters");
  const buttons = page.locator(".catalog-main .product-card .compare-button");
  await buttons.nth(0).click();
  await buttons.nth(1).click();
  await buttons.nth(2).click();
  await buttons.nth(3).click();
  await expect(page.getByRole("status")).toContainText("حداکثر سه محصول");
  await page.goto("/products/abrasives");
  await page.locator(".catalog-main .compare-button").first().click();
  await expect(page.getByRole("status")).toContainText("محصولات یک دسته");
  await page.goto("/compare");
  await expect(page.locator(".compare-product-head")).toHaveCount(3);
  const rows = await page.locator(".comparison-table tbody tr").count();
  await page.getByRole("checkbox", { name: "فقط تفاوت‌ها" }).check();
  expect(await page.locator(".comparison-table tbody tr").count()).toBeLessThan(
    rows,
  );
  await page.getByRole("link", { name: /استعلام محصولات انتخاب‌شده/ }).click();
  await expect(page.locator(".quote-item")).toHaveCount(3);
});

test("Quote: validation, Persian number normalization, persisted reference and form recovery", async ({
  page,
}) => {
  await page.goto("/quote?product=laser-distance-meters-1");
  await page
    .getByRole("button", { name: "ارسال درخواست", exact: true })
    .click();
  await expect(page.locator("#error-name")).toBeVisible();
  await expect(page.locator("#error-phone")).toBeVisible();
  await expect(page.locator("#error-consent")).toBeVisible();
  await page.getByLabel("نام و نام خانوادگی").fill("آزمون خودکار کانوکس");
  await page.getByLabel("شماره تماس", { exact: false }).fill("۰۹۰۰۰۰۰۰۰۰۰");
  await page
    .getByLabel("درباره نیازتان بیشتر بگویید")
    .fill("KONVEX_AUTOMATED_QA — no external contact");
  await page.locator("input[name=consent]").check();
  await page.route("**/api/quotes", (route) => route.abort());
  await page
    .getByRole("button", { name: "ارسال درخواست", exact: true })
    .click();
  await expect(page.locator(".form-error")).toBeVisible();
  await expect(page.getByLabel("نام و نام خانوادگی")).toHaveValue(
    "آزمون خودکار کانوکس",
  );
  await page.unroute("**/api/quotes");
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/api/quotes") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "ارسال درخواست", exact: true })
    .click();
  expect((await response).status()).toBe(201);
  await expect(
    page.getByRole("heading", { name: "درخواست آزمایشی شما ثبت شد." }),
  ).toBeVisible();
  await expect(page.locator(".reference-box bdi")).toHaveText(
    /^KV-\d{6}-[A-F0-9]{6}$/,
  );
});

test("Security: CSRF and origin rejection, idempotency and protected admin APIs", async ({
  request,
}) => {
  const missing = await request.post("/api/quotes", { data: {} });
  expect(missing.status()).toBe(403);
  const admin = await request.get(
    "/api/admin/products?id=laser-distance-meters-1",
  );
  expect(admin.status()).toBe(401);
  const csrf = await request.get("/api/csrf");
  const { token } = await csrf.json();
  const payload = {
    name: "آزمون امنیت کانوکس",
    phone: samplePhone,
    email: "",
    notes: "KONVEX_AUTOMATED_QA idempotency",
    purpose: "quote",
    preferredContact: "phone",
    consent: true,
    website: "",
    items: [{ productId: "laser-distance-meters-1", quantity: 2 }],
    idempotencyKey: crypto.randomUUID(),
  };
  const badOrigin = await request.post("/api/quotes", {
    headers: { origin: "https://untrusted.example", "x-csrf-token": token },
    data: payload,
  });
  expect(badOrigin.status()).toBe(403);
  const one = await request.post("/api/quotes", {
    headers: { origin: apiOrigin, "x-csrf-token": token },
    data: payload,
  });
  expect(one.status()).toBe(201);
  const two = await request.post("/api/quotes", {
    headers: { origin: apiOrigin, "x-csrf-token": token },
    data: payload,
  });
  expect(two.status()).toBe(200);
  expect((await one.json()).reference).toEqual((await two.json()).reference);
  const invalid = await request.post("/api/quotes", {
    headers: { origin: apiOrigin, "x-csrf-token": token },
    data: { ...payload, idempotencyKey: crypto.randomUUID(), phone: "invalid" },
  });
  expect(invalid.status()).toBe(422);
});

test("CMS: secure login, product creation, update, upload, public reflection and deletion", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("رمز مدیریت").fill(password);
  await page.getByRole("button", { name: "ورود به مدیریت" }).click();
  await expect(page.locator(".admin-shell")).toBeVisible();
  await page.getByRole("button", { name: "افزودن محصول" }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("نام محصول", { exact: false })
    .fill("محصول آزمون خودکار");
  await dialog.getByLabel(/^مدل/).fill("KV-QA-001");
  await dialog
    .getByLabel("کد کالا (SKU)", { exact: false })
    .fill("KV-QA-AUTOMATED");
  await dialog
    .getByLabel("آدرس مستقل محصول")
    .fill("konvex-automated-qa-product");
  await dialog
    .getByRole("button", { name: "ذخیره محصول", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.goto("/product/konvex-automated-qa-product");
  await expect(page.locator("h1")).toHaveText("محصول آزمون خودکار");
  await page.goto("/admin?tab=products&q=KV-QA-001");
  await page
    .getByRole("button", { name: "ویرایش محصول آزمون خودکار", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("نام محصول", { exact: false })
    .fill("محصول آزمون ویرایش‌شده");
  await dialog.getByRole("tab", { name: "تصاویر و محتوا" }).click();
  const upload = page.waitForResponse((r) =>
    r.url().endsWith("/api/admin/upload"),
  );
  await dialog
    .locator("input[type=file]")
    .setInputFiles("assets-source/laser.png");
  const result = await upload;
  expect(result.status()).toBe(200);
  const { url } = await result.json();
  expect((await page.request.get(url)).status()).toBe(200);
  await dialog
    .getByRole("button", { name: "ذخیره محصول", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.goto("/product/konvex-automated-qa-product");
  await expect(page.locator("h1")).toHaveText("محصول آزمون ویرایش‌شده");
  await expect(page.locator(".gallery-main>img")).toHaveAttribute("src", url);
  await page.goto("/admin?tab=quotes");
  await expect(page.locator(".admin-quotes")).toContainText(
    "آزمون خودکار کانوکس",
  );
  await page
    .locator(".admin-quote-card")
    .filter({ hasText: "آزمون خودکار کانوکس" })
    .locator("summary")
    .click();
  await page
    .locator(".admin-quote-card")
    .filter({ hasText: "آزمون خودکار کانوکس" })
    .locator("select")
    .selectOption("reviewing");
  await expect(page.getByRole("status")).toContainText("وضعیت درخواست");
  await page.goto("/admin?tab=products&q=KV-QA-001");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "حذف محصول آزمون ویرایش‌شده", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "محصولی پیدا نشد." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "خروج از مدیریت" }).click();
  await expect(page.getByLabel("رمز مدیریت")).toBeVisible();
  expect(
    (
      await page.request.get("/api/admin/products?id=laser-distance-meters-1")
    ).status(),
  ).toBe(401);
});

test("Mobile: menu, filters as bottom sheet, sticky product CTA and no overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "باز کردن منوی اصلی" }).click();
  const menu = page.getByRole("dialog", { name: "دسترسی سریع" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: /متر لیزری/ }).click();
  await expect(menu).not.toBeVisible();
  await expect(page).toHaveURL(/laser-distance-meters/);
  await page.getByRole("button", { name: "فیلترها", exact: true }).click();
  const filters = page.getByRole("dialog", { name: "فیلتر محصولات" });
  await expect(filters).toBeVisible();
  await filters
    .locator(".filter-option")
    .filter({ hasText: "60 m" })
    .getByRole("checkbox")
    .check();
  await filters.getByRole("button", { name: "اعمال فیلترها" }).click();
  await expect(filters).not.toBeVisible();
  await expect(page.locator(".catalog-main .product-card")).toHaveCount(1);
  await page.locator(".catalog-main .product-view-link").click();
  await expect(page.locator(".mobile-product-cta")).toBeVisible();
  await page.locator("#specifications").scrollIntoViewIfNeeded();
  await expect(page.locator(".mobile-product-cta .button")).toBeInViewport();
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(100);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow, "product overflow at " + width).toBe(false);
  }
});

test("SEO, documents, catalogue download and genuine 404 responses", async ({
  page,
  request,
}) => {
  await page.goto("/product/konvex-lm-60");
  expect(await page.title()).not.toContain("کانوکس | کانوکس");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute(
    "content",
    /noindex/,
  );
  const productJson = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(productJson.some((v) => JSON.parse(v)["@type"] === "Product")).toBe(
    true,
  );
  expect(
    productJson.some((v) => JSON.parse(v)["@type"] === "BreadcrumbList"),
  ).toBe(true);
  const doc = await request.get(
    "/api/products/laser-distance-meters-1/datasheet",
  );
  expect(doc.status()).toBe(200);
  expect(doc.headers()["content-disposition"]).toContain("attachment");
  expect(await doc.text()).toContain("کاتالوگ نمونه");
  const pdf = await request.get("/downloads/konvex-catalog-sample.pdf");
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  const missing = await request.get("/product/this-product-does-not-exist");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("این مسیر به محصولی نمی‌رسد");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/product/konvex-lm-60");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
});
