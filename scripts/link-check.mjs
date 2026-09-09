import fs from "node:fs";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const queue = ["/"];
const seen = new Set();
const results = [];
while (queue.length && seen.size < 250) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const response = await fetch(base + path, { redirect: "follow" });
  const type = response.headers.get("content-type") || "";
  const record = { path, status: response.status };
  if (type.includes("text/html")) {
    const html = await response.text();
    record.title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const href = m[1].replaceAll("&amp;", "&");
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const url = new URL(href, base);
      url.hash = "";
      const next = url.pathname + url.search;
      if (!seen.has(next) && !queue.includes(next)) queue.push(next);
    }
  }
  results.push(record);
}
fs.writeFileSync("docs/qa/link-check.json", JSON.stringify(results, null, 2));
console.log(
  "Links checked:",
  results.length,
  "Failures:",
  results.filter((r) => r.status >= 400),
);
console.log("Home title:", results[0].title);
