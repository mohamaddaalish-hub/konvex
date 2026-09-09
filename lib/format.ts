import imageManifest from "@/data/image-manifest.json";
export const faNumber = (n: number | string) =>
  new Intl.NumberFormat("fa-IR").format(Number(n));
export function normalizeDigits(input: string) {
  return input
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));
}
export function normalizeSearch(input: string) {
  return normalizeDigits(input)
    .toLowerCase()
    .replace(/\bmillimet(?:er|re)s?\b/g, " mm ")
    .replace(/\bcentimet(?:er|re)s?\b/g, " cm ")
    .replace(/\bkilograms?\b/g, " kg ")
    .replace(/\bmet(?:er|re)s?\b/g, " m ")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/بتن[\s\u200c]*کن/g, "بتنکن")
    .replace(/میلی[\s\u200c]*متر(?:ی)?/g, " mm ")
    .replace(/سانتی[\s\u200c]*متر(?:ی)?/g, " cm ")
    .replace(/کیلو[\s\u200c]*گرم/g, " kg ")
    .replace(/[\u200c\u200d\-_–]/g, " ")
    .replace(/(^|[\s\d])متری?(?=$|\s)/g, "$1 m ")
    .replace(/([a-z])(?=\d)/g, "$1 ")
    .replace(/(\d)(?=[a-z])/g, "$1 ")
    .replace(/[^\p{L}\p{N}.+±\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export const imageSrcSet = (url: string) =>
  (imageManifest as Record<string, { width: number }>)[
    url.replace("/green/", "/")
  ]
    ? `${url.replace(".webp", "-tiny.webp")} 160w, ${url.replace(".webp", "-small.webp")} 400w, ${url.replace(".webp", "-medium.webp")} 800w, ${url} ${(imageManifest as Record<string, { width: number }>)[url.replace("/green/", "/")]?.width || 1024}w`
    : undefined;
export function isTechnical(value: string) {
  return !/[\u0600-\u06FF]/.test(value);
}
export function cleanText(value: string) {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
}

const greenSamples = new Set([
  "hero",
  "laser",
  "caster",
  "level",
  "abrasives",
  "measurement",
]);
export function brandImageSource(src: string) {
  const match = src.match(/^\/images\/([a-z-]+)\.webp$/);
  return match && greenSamples.has(match[1])
    ? src.replace("/images/", "/images/green/")
    : src;
}
