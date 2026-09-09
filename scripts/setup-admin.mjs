import { randomBytes } from "node:crypto";
import fs from "node:fs";
if (fs.existsSync(".env.local")) {
  console.log("Admin environment already exists. No change.");
  process.exit(0);
}
const password = randomBytes(18).toString("base64url"),
  secret = randomBytes(48).toString("base64url");
fs.writeFileSync(
  ".env.local",
  `ADMIN_PASSWORD=${password}\nSESSION_SECRET=${secret}\nSITE_URL=https://konvex.example\nSITE_INDEXABLE=false\nDATABASE_PATH=./data/konvex.sqlite\n`,
  { mode: 0o600 },
);
fs.mkdirSync("private", { recursive: true });
fs.writeFileSync(
  "private/admin-access.txt",
  `KONVEX — Local development administrator\n\nPath: /admin\nPassword: ${password}\n\nThis credential only protects the local demo. Rotate it before publishing.\nNever upload .env.local or this file to a public repository.\n`,
  { mode: 0o600 },
);
console.log(
  "Admin configured. Credentials stored in private/admin-access.txt (not public).",
);
