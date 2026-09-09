import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import {
  products,
  categories,
  brands,
  applications,
  articles,
  settings,
} from "@/data/seed";
import type { Product } from "./types";
import { normalizeSearch } from "./format";
import translationSeed from "@/data/translations/en-content.json";

type DB = InstanceType<typeof Database>;
const globalDB = globalThis as unknown as { konvexDB?: DB };
export function writeProduct(db: DB, product: Product) {
  const categoryRow = db
    .prepare("SELECT data FROM entities WHERE type='category' AND id=?")
    .get(product.categoryId) as { data: string } | undefined;
  const category = categoryRow ? JSON.parse(categoryRow.data) : {};
  const translatedRow = db
    .prepare(
      "SELECT data FROM content_translations WHERE type='product' AND entity_id=? AND locale='en'",
    )
    .get(product.id) as { data: string } | undefined;
  const englishTerms = translatedRow
    ? Object.values(
        JSON.parse(translatedRow.data) as Record<string, { text: string }>,
      )
        .map((v) => v.text)
        .join(" ")
    : "";
  const terms = normalizeSearch(
    [
      product.name,
      product.model,
      product.sku,
      product.brand,
      product.categoryId,
      englishTerms,
      category.name || "",
      category.english || "",
      ...product.tags,
      ...product.specifications.map((s) => `${s.label} ${s.value}`),
    ].join(" "),
  );
  db.prepare(
    `INSERT INTO products(id,slug,sku,category_id,brand_id,name,model,featured,is_new,popularity,created_at,data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,sku=excluded.sku,category_id=excluded.category_id,brand_id=excluded.brand_id,name=excluded.name,model=excluded.model,featured=excluded.featured,is_new=excluded.is_new,popularity=excluded.popularity,created_at=excluded.created_at,data=excluded.data`,
  ).run(
    product.id,
    product.slug,
    product.sku,
    product.categoryId,
    product.brandId,
    product.name,
    product.model,
    +product.featured,
    +product.isNew,
    product.popularityRank,
    product.createdAt,
    JSON.stringify(product),
  );
  db.prepare("DELETE FROM product_attributes WHERE product_id=?").run(
    product.id,
  );
  const attr = db.prepare(
    "INSERT OR REPLACE INTO product_attributes(product_id,key,value,numeric_value) VALUES(?,?,?,?)",
  );
  for (const spec of product.specifications)
    attr.run(
      product.id,
      spec.key,
      spec.value,
      Number.parseFloat(normalizeSearch(spec.value)) || null,
    );
  db.prepare("DELETE FROM product_applications WHERE product_id=?").run(
    product.id,
  );
  const app = db.prepare(
    "INSERT OR IGNORE INTO product_applications(product_id,application_id) VALUES(?,?)",
  );
  for (const a of product.applications) app.run(product.id, a);
  db.prepare("DELETE FROM product_search WHERE product_id=?").run(product.id);
  db.prepare("INSERT INTO product_search(product_id,terms) VALUES(?,?)").run(
    product.id,
    terms,
  );
}
export function getDB(): DB {
  if (globalDB.konvexDB) return globalDB.konvexDB;
  const file = path.resolve(process.env.DATABASE_PATH || "data/konvex.sqlite");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(`
  CREATE TABLE IF NOT EXISTS content_translations(type TEXT NOT NULL,entity_id TEXT NOT NULL,locale TEXT NOT NULL,data TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(type,entity_id,locale));
  CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS entities(type TEXT NOT NULL,id TEXT NOT NULL,slug TEXT NOT NULL,data TEXT NOT NULL,order_no INTEGER DEFAULT 0,PRIMARY KEY(type,id),UNIQUE(type,slug));
  CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,sku TEXT NOT NULL UNIQUE,category_id TEXT NOT NULL,brand_id TEXT NOT NULL,name TEXT NOT NULL,model TEXT NOT NULL,featured INTEGER NOT NULL DEFAULT 0,is_new INTEGER NOT NULL DEFAULT 0,popularity INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,data TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id,created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
  CREATE INDEX IF NOT EXISTS idx_products_collection ON products(featured,is_new,popularity DESC);
  CREATE TABLE IF NOT EXISTS product_attributes(product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,key TEXT NOT NULL,value TEXT NOT NULL,numeric_value REAL,PRIMARY KEY(product_id,key));
  CREATE INDEX IF NOT EXISTS idx_attributes_filter ON product_attributes(key,value,product_id);
  CREATE INDEX IF NOT EXISTS idx_attributes_number ON product_attributes(key,numeric_value);
  CREATE TABLE IF NOT EXISTS product_applications(product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,application_id TEXT NOT NULL,PRIMARY KEY(product_id,application_id));
  CREATE INDEX IF NOT EXISTS idx_applications_filter ON product_applications(application_id,product_id);
  CREATE VIRTUAL TABLE IF NOT EXISTS product_search USING fts5(product_id UNINDEXED,terms,tokenize='unicode61 remove_diacritics 2');
  CREATE TABLE IF NOT EXISTS quotes(id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,idempotency_key TEXT NOT NULL UNIQUE,status TEXT NOT NULL DEFAULT 'new',created_at TEXT NOT NULL,data TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(created_at DESC);
  CREATE TABLE IF NOT EXISTS rate_limits(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL);
 `);
  if (!db.prepare("SELECT id FROM settings WHERE id=1").get()) {
    db.transaction(() => {
      db.prepare("INSERT INTO settings(id,data) VALUES(1,?)").run(
        JSON.stringify(settings),
      );
      const e = db.prepare(
        "INSERT OR IGNORE INTO entities(type,id,slug,data,order_no) VALUES(?,?,?,?,?)",
      );
      for (const c of categories)
        e.run("category", c.id, c.slug, JSON.stringify(c), c.order);
      for (const b of brands) e.run("brand", b.id, b.id, JSON.stringify(b), 0);
      for (const a of applications)
        e.run("application", a.id, a.slug, JSON.stringify(a), 0);
      for (const a of articles)
        e.run("article", a.id, a.slug, JSON.stringify(a), 0);
      for (const p of products) writeProduct(db, p);
      db.prepare(
        "INSERT OR IGNORE INTO migrations(version,applied_at) VALUES(1,?)",
      ).run(new Date().toISOString());
    })();
  }
  const translationInsert = db.prepare(
    "INSERT OR IGNORE INTO content_translations(type,entity_id,locale,data,updated_at) VALUES(?,?,'en',?,?)",
  );
  let addedTranslations = 0;
  db.transaction(() => {
    for (const item of translationSeed as unknown as {
      type: string;
      id: string;
      fields: Record<string, { source: string; text: string }>;
    }[])
      addedTranslations += translationInsert.run(
        item.type,
        item.id,
        JSON.stringify(item.fields),
        new Date().toISOString(),
      ).changes;
    if (addedTranslations) {
      for (const row of db
        .prepare(
          "SELECT entity_id,data FROM content_translations WHERE type='product' AND locale='en'",
        )
        .all() as { entity_id: string; data: string }[]) {
        const existing = db
          .prepare("SELECT terms FROM product_search WHERE product_id=?")
          .get(row.entity_id) as { terms: string } | undefined;
        if (!existing) continue;
        const extra = Object.values(
          JSON.parse(row.data) as Record<string, { text: string }>,
        )
          .map((v) => v.text)
          .join(" ");
        db.prepare("DELETE FROM product_search WHERE product_id=?").run(
          row.entity_id,
        );
        db.prepare(
          "INSERT INTO product_search(product_id,terms) VALUES(?,?)",
        ).run(row.entity_id, normalizeSearch(existing.terms + " " + extra));
      }
    }
  })();
  globalDB.konvexDB = db;
  return db;
}
