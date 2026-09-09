import {
  createHmac,
  randomBytes,
  timingSafeEqual,
  scryptSync,
} from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
const secret = () => process.env.SESSION_SECRET || "";
function sign(value: string) {
  if (!secret()) throw new Error("Server security is not configured");
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
function equal(a: string, b: string) {
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function makeCsrf() {
  const token = randomBytes(32).toString("base64url");
  return `${token}.${sign(token)}`;
}
function validSigned(value: string) {
  const [payload, sig] = value.split(".");
  return !!payload && !!sig && equal(sig, sign(payload));
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const host = parsed.host;
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      [
        new URL(req.url).host,
        req.headers.get("host"),
        req.headers.get("x-forwarded-host"),
        process.env.SITE_URL ? new URL(process.env.SITE_URL).host : "",
      ].includes(host)
    );
  } catch {
    return false;
  }
}
export function verifyCsrf(req: NextRequest) {
  if (!sameOrigin(req)) return false;
  const cookie = req.cookies.get("kv-csrf")?.value || "";
  const header = req.headers.get("x-csrf-token") || "";
  return !!cookie && equal(cookie, header) && validSigned(cookie);
}
export function secureCookie(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:"
  );
}
const rateLimitStore = globalThis as unknown as {
  konvexRateLimits?: Map<string, { count: number; resetAt: number }>;
};
export function rateLimit(
  req: NextRequest,
  scope: string,
  limit = 10,
  windowMs = 600000,
) {
  const ip = (
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "local"
  ).split(",")[0].trim().slice(0, 80);
  const bucket = createHmac("sha256", secret() || "local-rate-limit")
    .update(`${scope}:${ip}`)
    .digest("hex");
  const now = Date.now();
  const store =
    rateLimitStore.konvexRateLimits ||
    (rateLimitStore.konvexRateLimits = new Map());
  for (const [key, value] of store)
    if (value.resetAt < now) store.delete(key);
  const row = store.get(bucket);
  if (row && row.count >= limit) return false;
  if (row) row.count += 1;
  else store.set(bucket, { count: 1, resetAt: now + windowMs });
  return true;
}

export function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password.length > 256) return false;
  return timingSafeEqual(
    scryptSync(password, secret(), 64),
    scryptSync(expected, secret(), 64),
  );
}
export function createSession() {
  const body = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Date.now() + 8 * 60 * 60 * 1000,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}
export function validSession(value: string) {
  try {
    if (!value || !validSigned(value)) return false;
    const data = JSON.parse(
      Buffer.from(value.split(".")[0], "base64url").toString(),
    );
    return data.role === "admin" && data.exp > Date.now();
  } catch {
    return false;
  }
}
export async function isAdmin() {
  return validSession((await cookies()).get("kv-admin")?.value || "");
}
export function requireAdmin(req: NextRequest) {
  return (
    validSession(req.cookies.get("kv-admin")?.value || "") && verifyCsrf(req)
  );
}
