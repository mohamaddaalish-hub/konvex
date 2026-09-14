# Konvex product-showcase expansion

Industrial catalog, not a store. Existing 32-SKU sample catalog kept. No extra photos beyond `assets-source/`. No OEM Konvex datasheet was found; unverified numbers were not added.

## Images (9 source files)

| File | What the photograph actually shows | Used as |
| --- | --- | --- |
| `laser.png` | Konvex handheld laser meter, dual front window, LCD with a live reading | Hero of the laser family |
| `measurement.png` | Same instrument in a building interior | 2nd laser gallery image |
| `accessories.png` | Zippered fabric pouch + nylon strap with plastic buckle | 3rd laser image; only image on the two accessory SKUs |
| `caster.png` | PU tread, 4-bolt plate, lever on the swivel horn | Caster family hero |
| `level.png` | Box-beam level, three vials, end caps | Level family hero |
| `abrasives.png` | Fibre discs, centre hole, Konvex mark | Abrasive family hero |
| `chisels.png` | Three tips (point, flat, wide) | Chisel family hero |
| `hero.png` | Lifestyle set on concrete (chisel / level / caster / discs). A “RONVEX” mark is visible on one laser body — not treated as a Konvex SKU | Context image for chisels, casters, levels |
| `workshop.png` | Workshop cutting/finishing scene | 2nd abrasive image |

Green presentation variants (`/images/green/…`) are used for hero, laser, caster, level, abrasives and measurement only. Chisels and accessories stay on the original files.

## Unique products vs groups

Still **32 SKUs** (6 lasers, 6 chisels, 6 casters, 6 levels, 6 discs, 2 accessories). Photographs of the same physical object are **one gallery per family**, not extra products.

| Group | SKUs | Gallery |
| --- | --- | --- |
| Laser distance meters | `konvex-lm-30` … `konvex-lm-120-pro` (incl. `konvex-lm-60` / `KV-LM60`) | laser → measurement → accessories |
| Concrete chisels | `konvex-chisel-1-400` … `-6-400` | chisels → hero |
| Industrial casters | `konvex-caster-100-2` … `-200-4` | caster → hero |
| Spirit levels | `konvex-level-30` … `-120` | level → hero |
| Abrasives | `konvex-disc-115-2` … `-230-4` | abrasives → workshop |
| Accessories | `konvex-meter-case`, `konvex-meter-wrist-strap` | accessories only (1 image) |

## Created / updated

**Created:** `data/family-notes.ts` (visual ID + industry context, never SKU certification); `lib/product-variants.ts` (family chips from existing spec keys).

**Updated:** `data/seed.ts` (shared `familyGallery()`, sibling `relatedProductIds`, fibre-disc copy); `data/translations/en-content.json`; `i18n/ui-en.json`; product page (family chips, family note, specs jump, related `.slice(0,4)`, FAQ JSON-LD via `tr()`); `components/product-gallery.tsx` (RTL swipe, prev/next, unique thumb keys, `touch-action: pan-y`); `lib/format.ts` green swap; `lib/content-translations.ts` (always load category / application / brand English); `styles/base.css` + `design-system.css` (variant chips, family note); rebuilt `app/globals.css`.

**Not duplicated:** no new categories, no extra SKUs, no fake price/reviews/certs.

## Categories (unchanged)

Concrete chisels · Industrial casters · Spirit levels · Laser distance meters · Abrasives · Accessories. FA/EN names come from existing seed + `en-content.json`.

## Sources (context only)

- SDS-Plus vs SDS-Max shank geometry (not interchangeable).
- ISO 16331-1: range/accuracy depend on target, light and temperature; LCD `60.000 m` is a photo reading, not a proven max range.
- EN 12413 Type 27 / 41 language; photo does not prove cut vs grind.
- “Total-lock” = wheel + swivel; capacity not invented.
- KENZAX (nobelabzar) is a different brand — ignored.

## Enhancements

Family variant chips; identification notes with source disclaimer; laser 3-image gallery (`images[1]` remains `/measurement/`); RTL-aware gallery; English FAQ/Product JSON-LD; EN catalog title “Laser distance meters”.

## Unknowns (omitted or marked)

No Konvex OEM datasheet. Rated laser range, IP, accuracy, caster kg, disc type, and chisel shank remain **sample catalog values** already required by Playwright — not newly invented, not claimed as verified. Accessory photo is a **pouch shoulder strap**, not proof of a device wrist loop; seed still uses «بند مچی» because that SKU/search contract already exists. Hero “RONVEX” mark unused.

## Routes (existing, still live)

`/`, `/products`, `/products/{category}`, `/product/{slug}`, `/en/…`, `/quote?product=laser-distance-meters-1`, `/api/search`, `/api/products/{id}/datasheet`, `/sitemap.xml`. Key slug: `/product/konvex-lm-60`.

## Build / test

- `tsc --noEmit` — pass
- `next build --webpack` — pass
- HTTP smoke against `next start`: FA/EN product + catalog, family note, green galleries, `KV-LM60` / `SDS Max` / `۱۲۵ میلیمتر` search, datasheet «کاتالوگ نمونه» + EN `Measuring range`, sitemap, quote — 22/22
- Playwright e2e / `qa:smoke` — **not run**: Chromium download from `cdn.playwright.dev` fails TLS (`ECONNRESET`) in this environment
