import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
try {
  process.loadEnvFile?.(".env.local");
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const source = path.resolve(process.env.DATABASE_PATH || "data/konvex.sqlite");
const destination = path.resolve(
  "backups/konvex-" +
    new Date().toISOString().replace(/[:.]/g, "-") +
    ".sqlite",
);
fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 });
const db = new Database(source, { readonly: true, fileMustExist: true });
try {
  await db.backup(destination);
  fs.chmodSync(destination, 0o600);
  console.log("Consistent SQLite backup saved to " + destination);
} finally {
  db.close();
}
