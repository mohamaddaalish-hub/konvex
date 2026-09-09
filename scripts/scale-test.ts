import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { getDB, writeProduct } from "../lib/db";
import { queryProducts } from "../lib/catalog";
import { products } from "../data/seed";
const file = path.resolve(".cache/qa-scale.sqlite");
fs.mkdirSync(path.dirname(file), { recursive: true });
for (const ext of ["", "-wal", "-shm"])
  if (fs.existsSync(file + ext)) fs.unlinkSync(file + ext);
process.env.DATABASE_PATH = file;
const db = getDB(),
  start = performance.now();
db.transaction(() => {
  db.prepare("DELETE FROM products").run();
  db.prepare("DELETE FROM product_search").run();
  for (let i = 0; i < 5000; i++) {
    const p = products[i % products.length];
    writeProduct(db, {
      ...p,
      id: "benchmark-" + i,
      slug: "benchmark-product-" + i,
      sku: "BENCH-" + i,
      model: p.model + " B" + i,
      name: p.name + " — " + i,
    });
  }
})();
const creationMs = performance.now() - start;
const cases = [
  { name: "First catalog page", query: { pageSize: 12 } },
  {
    name: "Laser category and all its facets",
    query: { category: "laser-distance-meters", pageSize: 12 },
  },
  {
    name: "Technical model full-text search",
    query: { query: "KV-LM60", pageSize: 12 },
  },
  {
    name: "Combined technical facets",
    query: {
      category: "laser-distance-meters",
      filters: { range: ["60 m", "80 m"], protection: ["IP54"] },
      pageSize: 12,
    },
  },
  { name: "Deep pagination", query: { page: 400, pageSize: 12 } },
];
const results = cases.map((c) => {
  queryProducts(c.query);
  const times = [];
  let total = 0,
    bytes = 0;
  for (let i = 0; i < 20; i++) {
    const t = performance.now();
    const r = queryProducts(c.query);
    times.push(performance.now() - t);
    total = r.total;
    bytes = Buffer.byteLength(JSON.stringify(r));
  }
  times.sort((a, b) => a - b);
  return {
    name: c.name,
    total,
    averageMs: Number(
      (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
    ),
    p95Ms: Number(times[18].toFixed(2)),
    responseBytes: bytes,
  };
});
const report = {
  date: new Date().toISOString(),
  environment:
    "Isolated local SQLite repository benchmark; not an HTTP concurrency or production load test.",
  products: 5000,
  creationMs: Math.round(creationMs),
  results,
};
fs.writeFileSync("docs/qa/scale-5000.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
db.close();
for (const ext of ["", "-wal", "-shm"])
  if (fs.existsSync(file + ext)) fs.unlinkSync(file + ext);
