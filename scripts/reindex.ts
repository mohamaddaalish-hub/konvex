import { getDB, writeProduct } from "../lib/db";
import { getAllProducts } from "../lib/catalog";
const db = getDB();
db.transaction(() => {
  for (const p of getAllProducts()) writeProduct(db, p);
})();
console.log("Search index rebuilt.");
