import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
});
const summary = [];
try {
  for (const [name, path, desktop] of [
    ["home-mobile", "/", false],
    ["home-desktop", "/", true],
    ["catalog-mobile", "/products/laser-distance-meters", false],
    ["product-mobile", "/product/konvex-lm-60", false],
  ]) {
    const flags = {
      port: chrome.port,
      logLevel: "error",
      output: ["json", "html"],
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      ...(desktop
        ? {
            formFactor: "desktop",
            screenEmulation: {
              mobile: false,
              width: 1440,
              height: 1000,
              deviceScaleFactor: 1,
              disabled: false,
            },
            throttling: {
              rttMs: 40,
              throughputKbps: 10240,
              cpuSlowdownMultiplier: 1,
              requestLatencyMs: 0,
              downloadThroughputKbps: 0,
              uploadThroughputKbps: 0,
            },
          }
        : {}),
    };
    const result = await lighthouse(base + path, flags);
    const r = result.lhr;
    fs.writeFileSync(`docs/qa/lighthouse-${name}.json`, result.report[0]);
    fs.writeFileSync(`docs/qa/lighthouse-${name}.html`, result.report[1]);
    const row = {
      name,
      url: path,
      version: r.lighthouseVersion,
      scores: Object.fromEntries(
        Object.entries(r.categories).map(([k, v]) => [
          k,
          Math.round(v.score * 100),
        ]),
      ),
      lcp: r.audits["largest-contentful-paint"].numericValue,
      cls: r.audits["cumulative-layout-shift"].numericValue,
      tbt: r.audits["total-blocking-time"].numericValue,
      fcp: r.audits["first-contentful-paint"].numericValue,
      opportunities: Object.values(r.audits)
        .filter((a) => a.score !== null && a.score < 0.9)
        .map((a) => ({ id: a.id, title: a.title, value: a.displayValue })),
    };
    summary.push(row);
    console.log(JSON.stringify(row));
  }
} finally {
  await chrome.kill();
  fs.writeFileSync(
    "docs/qa/lighthouse-summary.json",
    JSON.stringify(summary, null, 2),
  );
}
