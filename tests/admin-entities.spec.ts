import {
  test,
  expect,
  request as playwrightRequest,
  type APIRequestContext,
} from "@playwright/test";
import fs from "node:fs";
import Database from "better-sqlite3";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const password = fs
  .readFileSync(".env.local", "utf8")
  .match(/^ADMIN_PASSWORD=(.+)$/m)![1];
let api: APIRequestContext, headers: Record<string, string>;
test.beforeAll(async () => {
  api = await playwrightRequest.newContext({ baseURL: base });
  const { token } = await (await api.get("/api/csrf")).json();
  headers = {
    origin: base,
    "x-csrf-token": token,
    "x-forwarded-for": "198.51.100.253",
  };
  const login = await api.post("/api/admin/login", {
    headers,
    data: { password },
  });
  expect(login.status()).toBe(200);
});
test.afterAll(async () => {
  await api.dispose();
});

test("CMS entities: hierarchy, cycles, dynamic filters, brand cascade, articles and safe deletion", async () => {
  const id = "kv-automated-qa-",
    parent = {
      id: id + "parent",
      slug: id + "parent",
      name: "گروه والد آزمایشی",
      english: "QA PARENT",
      description: "گروه آزمایشی برای بررسی سلسله مراتب",
      image: "/images/laser.webp",
      order: 99,
      filters: [],
    };
  const child = {
    ...parent,
    id: id + "child",
    slug: id + "child",
    name: "گروه فرزند آزمایشی",
    parentId: parent.id,
    filters: [{ key: "range", label: "برد اندازه‌گیری", numeric: true }],
  };
  const brand = {
    id: id + "brand",
    name: "QA TOOL BRAND",
    english: "QA TOOL BRAND",
    description: "Temporary automated test brand",
    logo: "",
  };
  const postEntity = (type: string, data: unknown) =>
    api.post("/api/admin/entities", { headers, data: { type, data } });
  const remove = (type: string, id: string) =>
    api.delete("/api/admin/entities", { headers, data: { type, id } });
  const source = (
    await (
      await api.get("/api/admin/products?id=laser-distance-meters-1")
    ).json()
  ).product;
  const product = {
    ...source,
    id: id + "product",
    slug: id + "product",
    sku: "KV-QA-ENTITY-01",
    name: "محصول آزمایشی مستقل",
    model: "KV-QA-ENTITY-01",
    brandId: brand.id,
    brand: brand.name,
    categoryId: child.id,
    relatedProductIds: [],
    compatibleProductIds: [],
    accessoryIds: [],
  };
  const sibling = {
    ...product,
    id: id + "sibling",
    slug: id + "sibling",
    sku: "KV-QA-ENTITY-02",
    model: "KV-QA-ENTITY-02",
    relatedProductIds: [product.id],
    compatibleProductIds: [product.id],
    accessoryIds: [product.id],
  };
  const article = {
    id: id + "article",
    slug: id + "article",
    title: "راهنمای آزمون خودکار",
    excerpt: "این محتوای موقت بعد از آزمون حذف می‌شود.",
    image: "/images/laser.webp",
    category: "آزمون",
    readTime: 2,
    sections: [
      {
        title: "انتخاب نمونه",
        body: "اطلاعات نمونه برای بررسی مدیریت دانشنامه.",
      },
    ],
    relatedCategory: child.id,
    publishedAt: "2026-09-06",
    seoTitle: "",
    seoDescription: "",
  };
  try {
    expect((await postEntity("category", parent)).status()).toBe(200);
    expect((await postEntity("category", child)).status()).toBe(200);
    expect(
      (
        await postEntity("category", { ...parent, parentId: child.id })
      ).status(),
    ).toBe(422);
    expect(
      (
        await postEntity("category", {
          ...child,
          filters: [
            { key: "range", label: "برد" },
            { key: "range", label: "برد تکراری" },
          ],
        })
      ).status(),
    ).toBe(422);
    expect((await postEntity("brand", brand)).status()).toBe(200);
    expect(
      (
        await api.post("/api/admin/products", { headers, data: product })
      ).status(),
    ).toBe(200);
    expect(
      (
        await api.post("/api/admin/products", { headers, data: sibling })
      ).status(),
    ).toBe(200);
    const parentPage = await api.get("/products/" + parent.slug);
    expect(parentPage.status()).toBe(200);
    expect(await parentPage.text()).toContain("KV-QA-ENTITY-01");
    expect(
      (
        await postEntity("brand", { ...brand, name: "QA RENAMED UNIQUE BRAND" })
      ).status(),
    ).toBe(200);
    const changed = (
      await (await api.get("/api/admin/products?id=" + product.id)).json()
    ).product;
    expect(changed.brand).toBe("QA RENAMED UNIQUE BRAND");
    const search = await (
      await api.get("/api/search?q=QA+RENAMED+UNIQUE+BRAND")
    ).json();
    expect(search.total).toBe(2);
    expect((await postEntity("article", article)).status()).toBe(200);
    expect((await api.get("/knowledge/" + article.slug)).status()).toBe(200);
    expect(
      (
        await postEntity("article", {
          ...article,
          title: "راهنمای ویرایش‌شده آزمون",
        })
      ).status(),
    ).toBe(200);
    expect(
      await (await api.get("/knowledge/" + article.slug)).text(),
    ).toContain("راهنمای ویرایش‌شده آزمون");
    const sitemap = await (await api.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/product/" + product.slug);
    expect(sitemap).toContain("/knowledge/" + article.slug);
    expect((await remove("category", parent.id)).status()).toBe(409);
    expect((await remove("category", child.id)).status()).toBe(409);
    expect((await remove("brand", brand.id)).status()).toBe(409);
    expect(
      (
        await api.post("/api/admin/products", {
          headers,
          data: { ...product, id: id + "duplicate" },
        })
      ).status(),
    ).toBe(409);
    const html = "<script>alert(1)</script>";
    expect(
      (
        await api.post("/api/admin/products", {
          headers,
          data: {
            ...product,
            name: "محصول آزمایشی " + html,
            longDescription: html,
          },
        })
      ).status(),
    ).toBe(200);
    const sheet = await (
      await api.get("/api/products/" + product.id + "/datasheet")
    ).text();
    expect(sheet).not.toContain(html);
    expect(sheet).toContain("&lt;script&gt;");
    expect(
      (
        await api.delete("/api/admin/products", {
          headers,
          data: { id: product.id },
        })
      ).status(),
    ).toBe(200);
    const remains = (
      await (await api.get("/api/admin/products?id=" + sibling.id)).json()
    ).product;
    expect(remains.relatedProductIds).toEqual([]);
    expect(remains.compatibleProductIds).toEqual([]);
    expect(remains.accessoryIds).toEqual([]);
  } finally {
    await remove("article", article.id);
    for (const p of [product, sibling])
      await api.delete("/api/admin/products", { headers, data: { id: p.id } });
    await remove("category", child.id);
    await remove("category", parent.id);
    await remove("brand", brand.id);
  }
});

test("Contact settings save and reflect publicly without changing page code", async ({
  page,
}) => {
  const db = new Database(process.env.DATABASE_PATH || "data/konvex.sqlite", {
    readonly: true,
  });
  const original = JSON.parse(
    (
      db.prepare("SELECT data FROM settings WHERE id=1").get() as {
        data: string;
      }
    ).data,
  );
  db.close();
  try {
    const changed = {
      ...original,
      phone: "+00000000000",
      email: "qa@example.invalid",
      address: "نشانی موقت آزمون خودکار",
      hours: "ساعت کاری آزمایشی",
      sampleMode: true,
    };
    expect(
      (
        await api.post("/api/admin/settings", { headers, data: changed })
      ).status(),
    ).toBe(200);
    await page.goto("/contact");
    await expect(page.locator('a[href="tel:+00000000000"]')).not.toHaveCount(0);
    await expect(
      page.locator('a[href="mailto:qa@example.invalid"]'),
    ).not.toHaveCount(0);
    await expect(
      page.getByText("نشانی موقت آزمون خودکار", { exact: true }).first(),
    ).toBeVisible();
  } finally {
    expect(
      (
        await api.post("/api/admin/settings", { headers, data: original })
      ).status(),
    ).toBe(200);
  }
});

test("Security: bounded JSON streams, malformed JSON, upload isolation and rate limiting", async () => {
  const publicApi = await playwrightRequest.newContext({ baseURL: base });
  const { token } = await (await publicApi.get("/api/csrf")).json();
  const h = {
    origin: base,
    "x-csrf-token": token,
    "x-forwarded-for": "198.51.100.252",
    "content-type": "application/json",
  };
  try {
    expect(
      (
        await publicApi.post("/api/quotes", {
          headers: h,
          data: Buffer.from("not json"),
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await publicApi.post("/api/quotes", {
          headers: h,
          data: "x".repeat(21000),
        })
      ).status(),
    ).toBe(413);
    const cookies = (await publicApi.storageState()).cookies
      .map((c) => c.name + "=" + c.value)
      .join("; ");
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("x".repeat(21000)));
        controller.close();
      },
    });
    const streamed = await fetch(base + "/api/quotes", {
      method: "POST",
      headers: { ...h, cookie: cookies },
      body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    expect(streamed.status).toBe(413);
    const wrongType = await api.post("/api/admin/upload", {
      headers,
      multipart: {
        file: {
          name: "invalid.svg",
          mimeType: "image/svg+xml",
          buffer: Buffer.from('<svg onload="alert(1)"></svg>'),
        },
      },
    });
    expect(wrongType.status()).toBe(422);
    expect(
      (
        await publicApi.post("/api/admin/upload", {
          headers: h,
          multipart: {
            file: {
              name: "test.png",
              mimeType: "image/png",
              buffer: Buffer.from("invalid"),
            },
          },
        })
      ).status(),
    ).toBe(403);
    let last;
    for (let i = 0; i < 9; i++) {
      last = await publicApi.post("/api/quotes", {
        headers: { ...h, "x-forwarded-for": "198.51.100.251" },
        data: {},
      });
      if (i < 8) expect(last.status()).toBe(422);
    }
    expect(last!.status()).toBe(429);
    expect(last!.headers()["retry-after"]).toBe("600");
  } finally {
    await publicApi.dispose();
  }
});
