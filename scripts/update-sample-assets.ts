import { getDB, writeProduct } from "../lib/db";
import { products, categories } from "../data/seed";
const db = getDB();
db.transaction(() => {
  for (const p of products.filter((p) => p.categoryId === "accessories"))
    writeProduct(db, p);
  const c = categories.find((c) => c.id === "accessories")!;
  db.prepare(
    "UPDATE entities SET data=? WHERE type='category' AND id='accessories'",
  ).run(JSON.stringify(c));
})();
console.log("Accessory family assets updated.");
