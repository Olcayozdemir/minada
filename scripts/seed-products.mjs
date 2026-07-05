/**
 * Seeds the FULL product catalog (lib/catalog-data.ts — 9 categories, all
 * series incl. hidden ones, product photos from public/) into Sanity, so the
 * catalog keeps its content the moment a real project is connected and
 * editors take over from /studio.
 *
 * Usage (env can come from .env.local):
 *   npm run seed:products
 *
 * - Single source of truth: imports CATEGORIES/GROUPS_ALL from
 *   lib/catalog-data.ts directly (Node ≥23 type stripping).
 * - Idempotent: deterministic _id's (createOrReplace), safe to re-run.
 * - Images are uploaded from public/ (Sanity dedupes by content hash).
 * - DRY_RUN=1 prints a summary without writing.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import { CATEGORIES, GROUPS_ALL } from "../lib/catalog-data.ts";

// Minimal .env.local loader so the script works without extra deps.
try {
  for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* no .env.local — rely on the environment */
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dryRun = Boolean(process.env.DRY_RUN);

if (!projectId && !dryRun) {
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set.");
  process.exit(1);
}
if (!token && !dryRun) {
  console.error("SANITY_API_WRITE_TOKEN is not set (Editor token from sanity.io/manage).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// Upload each distinct product photo once; series sharing a photo share it.
const assetCache = new Map();
let uploadCount = 0;
async function uploadImage(publicPath) {
  if (!publicPath || typeof publicPath !== "string") return undefined;
  if (assetCache.has(publicPath)) return assetCache.get(publicPath);
  const file = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  if (!existsSync(file)) {
    console.warn(`  ! image missing on disk, skipped: ${publicPath}`);
    assetCache.set(publicPath, undefined);
    return undefined;
  }
  let ref;
  if (dryRun) {
    ref = { _type: "image", asset: { _type: "reference", _ref: `dry-${basename(publicPath)}` } };
  } else {
    const asset = await client.assets.upload("image", createReadStream(file), {
      filename: basename(publicPath),
    });
    ref = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  }
  uploadCount++;
  assetCache.set(publicPath, ref);
  return ref;
}

const docs = [];

// Categories — deterministic ids derived from their slugs.
const catId = (slug) => `productCategory-${slug}`;
for (const c of CATEGORIES) {
  docs.push({
    _id: catId(c.slug),
    _type: "productCategory",
    title: c.title,
    slug: { _type: "slug", current: c.slug },
    order: c.order ?? 0,
    ...(c.icon ? { icon: c.icon } : {}),
  });
}

// Brands — collected from the groups, ordered by first appearance.
const brandIds = new Map();
for (const g of GROUPS_ALL) {
  const b = g.brand;
  if (!b?.slug || brandIds.has(b.slug)) continue;
  brandIds.set(b.slug, `productBrand-${b.slug}`);
  docs.push({
    _id: `productBrand-${b.slug}`,
    _type: "productBrand",
    title: b.title,
    slug: { _type: "slug", current: b.slug },
    order: brandIds.size,
  });
}

// Groups — includes hidden series (they stay off-showcase via the flag).
for (const g of GROUPS_ALL) {
  docs.push({
    _id: `productGroup-${g.slug}`,
    _type: "productGroup",
    title: g.title,
    slug: { _type: "slug", current: g.slug },
    category: { _type: "reference", _ref: catId(g.category.slug) },
    brand: { _type: "reference", _ref: brandIds.get(g.brand.slug) },
    ...(g.powerRange ? { powerRange: g.powerRange } : {}),
    variants: (g.variants ?? []).map(Number),
    ...(g.warrantyProductYears ? { warrantyProductYears: g.warrantyProductYears } : {}),
    ...(g.warrantyPerformanceYears
      ? { warrantyPerformanceYears: g.warrantyPerformanceYears }
      : {}),
    features: g.features ?? [],
    image: await uploadImage(g.image),
    featured: Boolean(g.featured),
    hidden: Boolean(g.hidden),
    order: g.order ?? 0,
  });
}

const groups = docs.filter((d) => d._type === "productGroup");
const hidden = groups.filter((d) => d.hidden).length;
const summary =
  `${CATEGORIES.length} categories, ${brandIds.size} brands, ` +
  `${groups.length} groups (${groups.length - hidden} showcased, ${hidden} hidden), ` +
  `${uploadCount} images`;

if (dryRun) {
  console.log(`DRY RUN — ${docs.length} docs: ${summary}. Nothing written.`);
  console.log("Sample group:\n" + JSON.stringify(groups[0], null, 2));
  process.exit(0);
}

const tx = docs.reduce((t, d) => t.createOrReplace(d), client.transaction());
await tx.commit();
console.log(`Seeded ${docs.length} documents into ${projectId}/${dataset}: ${summary}.`);
