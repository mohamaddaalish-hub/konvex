import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const report = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [name, path] of [
    ["home", "/"],
    ["catalog", "/products/laser-distance-meters"],
    ["product", "/product/konvex-lm-60"],
    ["quote", "/quote?product=laser-distance-meters-1"],
    ["contact", "/contact"],
    ["admin", "/admin"],
  ]) {
    const r = await page.goto("http://127.0.0.1:3000" + path, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    const axe = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "wcag22aa",
      ])
      .analyze();
    report.push({
      name,
      width,
      status: r.status(),
      overflow,
      errors: [...errors],
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
          html: n.html,
        })),
      })),
    });
    if (["catalog", "product", "quote", "admin"].includes(name))
      await page.screenshot({
        path: `docs/qa/${name}-${width}.png`,
        fullPage: true,
      });
    console.log(
      name,
      width,
      r.status(),
      overflow.scroll,
      "axe:",
      axe.violations.map((v) => v.id + "(" + v.nodes.length + ")").join(",") ||
        "PASS",
    );
  }
  await context.close();
}
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
await page.goto("http://127.0.0.1:3000/print/catalog", {
  waitUntil: "networkidle",
});
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: "public/downloads/konvex-catalog-sample.pdf",
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
console.log("Sample catalogue PDF generated.");
fs.writeFileSync("docs/qa/smoke-report.json", JSON.stringify(report, null, 2));
await browser.close();
