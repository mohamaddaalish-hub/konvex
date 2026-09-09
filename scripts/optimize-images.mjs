import sharp from "sharp";
import fs from "node:fs/promises";
const manifest = {};
await fs.mkdir("public/images", { recursive: true });
for (const name of await fs.readdir("assets-source")) {
  if (!/^[a-z0-9-]+\.(png|jpe?g)$/i.test(name)) continue;
  const base = name.replace(/\.[^.]+$/, "");
  const source = await sharp("assets-source/" + name, {
    limitInputPixels: 40000000,
  })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile("public/images/" + base + ".webp", source.data);
  manifest["/images/" + base + ".webp"] = {
    width: source.info.width,
    height: source.info.height,
  };
  for (const [label, width] of [
    ["tiny", 160],
    ["small", 400],
    ["medium", 800],
  ])
    await sharp(source.data)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width === 160 ? 78 : 84 })
      .toFile("public/images/" + base + "-" + label + ".webp");
  console.log("Optimized:", base);
}
await fs.writeFile(
  "data/image-manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
