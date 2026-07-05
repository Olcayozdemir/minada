/**
 * Seeds the fallback blog posts (lib/blog-fallback.ts) into Sanity, so the
 * blog keeps its content the moment a real project is connected and editors
 * take over from /studio.
 *
 * Usage (env can come from .env.local):
 *   SANITY_API_WRITE_TOKEN=sk... npm run seed:posts
 *
 * - Idempotent: deterministic _id's (createOrReplace), safe to re-run.
 * - Cover images are uploaded from public/ (Sanity dedupes by content hash).
 * - DRY_RUN=1 prints the documents without writing.
 *
 * Requires Node ≥23 (imports the .ts data module via native type stripping).
 */
import { createReadStream, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import { fallbackPost, fallbackSlugs } from "../lib/blog-fallback.ts";

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

if (!projectId) {
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set.");
  process.exit(1);
}
if (!token && !dryRun) {
  console.error("SANITY_API_WRITE_TOKEN is not set (create an Editor token at sanity.io/manage).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

const slugify = (s) =>
  s
    .toLowerCase()
    .replaceAll("ç", "c").replaceAll("ğ", "g").replaceAll("ı", "i")
    .replaceAll("ö", "o").replaceAll("ş", "s").replaceAll("ü", "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const posts = fallbackSlugs().map(({ slug, language }) => ({
  language,
  ...fallbackPost(slug, language),
}));

// Upload each distinct cover once; posts sharing a photo share the asset.
const assetCache = new Map();
async function uploadCover(publicPath) {
  if (assetCache.has(publicPath)) return assetCache.get(publicPath);
  const file = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const asset = dryRun
    ? { _id: `dry-${basename(publicPath)}` }
    : await client.assets.upload("image", createReadStream(file), {
        filename: basename(publicPath),
      });
  const ref = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  assetCache.set(publicPath, ref);
  return ref;
}

const docs = [];
const seen = new Set();

function categoryDoc(title) {
  const id = `category-${slugify(title)}`;
  if (!seen.has(id)) {
    seen.add(id);
    docs.push({
      _id: id,
      _type: "category",
      title,
      slug: { _type: "slug", current: slugify(title) },
    });
  }
  return { _type: "reference", _ref: id };
}

function authorDoc(name) {
  const id = `author-${slugify(name)}`;
  if (!seen.has(id)) {
    seen.add(id);
    docs.push({ _id: id, _type: "author", name });
  }
  return { _type: "reference", _ref: id };
}

for (const p of posts) {
  docs.push({
    _id: `post-${p.language}-${p.slug}`,
    _type: "post",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    language: p.language,
    excerpt: p.excerpt,
    coverImage: await uploadCover(p.coverImage),
    category: p.category ? categoryDoc(p.category.title) : undefined,
    author: p.author ? authorDoc(p.author.name) : undefined,
    publishedAt: `${p.publishedAt}T09:00:00.000Z`,
    body: p.body,
  });
}

if (dryRun) {
  console.log(JSON.stringify(docs, null, 2));
  console.log(`\nDRY RUN — ${docs.length} documents, nothing written.`);
  process.exit(0);
}

const tx = docs.reduce((t, d) => t.createOrReplace(d), client.transaction());
await tx.commit();
console.log(
  `Seeded ${posts.length} posts (+${docs.length - posts.length} category/author docs) into ${projectId}/${dataset}.`,
);
