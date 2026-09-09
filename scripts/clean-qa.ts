import { getDB } from "../lib/db";
import { deleteProduct } from "../lib/catalog";
if (process.env.ALLOW_QA_MUTATIONS !== "1")
  throw new Error(
    "QA cleanup is only for a disposable demo database. Set ALLOW_QA_MUTATIONS=1 explicitly.",
  );
const db = getDB();
const products = db
  .prepare(
    "SELECT id FROM products WHERE (sku='KV-QA-AUTOMATED' AND slug='konvex-automated-qa-product') OR id LIKE 'kv-automated-qa-%'",
  )
  .all() as { id: string }[];
for (const p of products) deleteProduct(p.id);
db.prepare(
  "DELETE FROM quotes WHERE json_extract(data,'$.notes') LIKE 'KONVEX_AUTOMATED_QA%'",
).run();
db.prepare("DELETE FROM rate_limits").run();
console.log("Only automated QA records and local rate-limit counters cleared.");
