import { getDB } from "../lib/db";
const db = getDB();
console.log(
  "Catalogue initialized:",
  db.prepare("SELECT COUNT(*) count FROM products").get(),
);
