import type { Product } from "./types";

const distinguishing: Record<string, string[]> = {
  "laser-distance-meters": ["range"],
  "spirit-levels": ["length"],
  "industrial-casters": ["diameter", "type"],
  "concrete-chisels": ["type", "length"],
  abrasives: ["type", "diameter"],
  accessories: ["type"],
};

export function variantParts(product: Product) {
  const keys = distinguishing[product.categoryId] || [];
  const parts = keys
    .map((key) => product.specifications.find((s) => s.key === key)?.value)
    .filter(Boolean) as string[];
  return parts.length ? parts : [product.model];
}

export function variantLabel(product: Product) {
  return variantParts(product).join(" · ");
}

export function sortFamily(a: Product, b: Product) {
  const key = (distinguishing[a.categoryId] || [])[0];
  if (!key) return a.model.localeCompare(b.model);
  const na = parseFloat(
    a.specifications.find((s) => s.key === key)?.value || "",
  );
  const nb = parseFloat(
    b.specifications.find((s) => s.key === key)?.value || "",
  );
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
  return a.model.localeCompare(b.model);
}
