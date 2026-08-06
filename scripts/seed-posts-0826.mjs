/**
 * Seeds the 06.08.2026 blog batch into Sanity, in both locales.
 *
 * Source of truth: content/blog-0826/<slug>.<lang>.json — one file per article,
 * written by editors or by the content pipeline. Shape:
 *   { language, slug, altSlug, title, metaTitle, metaDescription, excerpt,
 *     keywords[], category, coverImage, publishedAt, blocks[{style,text}] }
 *
 * Usage (env comes from .env.local):
 *   node scripts/seed-posts-0826.mjs
 *   DRY_RUN=1 node scripts/seed-posts-0826.mjs   # validate + print, write nothing
 *
 * Idempotent: deterministic _id's (createOrReplace), safe to re-run.
 */
import { createReadStream, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";

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

const CONTENT_DIR = join(process.cwd(), "content", "blog-0826");
const VALID_STYLES = new Set(["normal", "h2", "h3", "blockquote"]);

const slugify = (s) =>
  s
    .toLowerCase()
    .replaceAll("ç", "c").replaceAll("ğ", "g").replaceAll("ı", "i")
    .replaceAll("ö", "o").replaceAll("ş", "s").replaceAll("ü", "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// --- load + validate ------------------------------------------------------
const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json")).sort();
const posts = [];
const problems = [];

for (const f of files) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(join(CONTENT_DIR, f), "utf8"));
  } catch (e) {
    problems.push(`${f}: geçersiz JSON (${e.message})`);
    continue;
  }
  const need = ["language", "slug", "title", "excerpt", "category", "coverImage", "publishedAt", "blocks"];
  for (const k of need) if (!doc[k]) problems.push(`${f}: "${k}" eksik`);
  if (doc.language && !["tr", "en"].includes(doc.language)) problems.push(`${f}: language "${doc.language}"`);
  if (Array.isArray(doc.blocks)) {
    doc.blocks.forEach((b, i) => {
      if (!b?.text?.trim()) problems.push(`${f}: blok ${i} boş`);
      if (b?.style && !VALID_STYLES.has(b.style)) problems.push(`${f}: blok ${i} stil "${b.style}"`);
      if (/[—–]/.test(b?.text || "")) problems.push(`${f}: blok ${i} uzun tire içeriyor`);
      if (/(\*\*|^#{1,4}\s|^- )/m.test(b?.text || "")) problems.push(`${f}: blok ${i} markdown içeriyor`);
    });
  }
  if (doc.metaTitle && doc.metaTitle.length > 62) problems.push(`${f}: metaTitle ${doc.metaTitle.length} karakter`);
  if (doc.metaDescription && (doc.metaDescription.length < 120 || doc.metaDescription.length > 165))
    problems.push(`${f}: metaDescription ${doc.metaDescription.length} karakter`);
  posts.push(doc);
}

// Cross-check that every altSlug points at a real counterpart.
const bySlug = new Map(posts.map((p) => [`${p.language}:${p.slug}`, p]));
for (const p of posts) {
  const other = p.language === "tr" ? "en" : "tr";
  if (p.altSlug && !bySlug.has(`${other}:${p.altSlug}`)) {
    problems.push(`${p.language}/${p.slug}: altSlug "${p.altSlug}" karşılığı yok`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} sorun:\n- ` + problems.join("\n- "));
  if (!process.env.FORCE) process.exit(1);
  console.error("\nFORCE=1 verildi, devam ediliyor.\n");
}

// --- build documents ------------------------------------------------------
let k = 0;
const key = () => `b${(k++).toString(36)}`;
const toBlock = (b) => ({
  _type: "block",
  _key: key(),
  style: b.style || "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text: b.text, marks: [] }],
});

const assetCache = new Map();
async function uploadCover(publicPath) {
  if (assetCache.has(publicPath)) return assetCache.get(publicPath);
  const file = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const asset = dryRun
    ? { _id: `dry-${basename(publicPath)}` }
    : await client.assets.upload("image", createReadStream(file), { filename: basename(publicPath) });
  const ref = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  assetCache.set(publicPath, ref);
  return ref;
}

const docs = [];
const seen = new Set();

function refDoc(type, title) {
  const id = `${type}-${slugify(title)}`;
  if (!seen.has(id)) {
    seen.add(id);
    docs.push(
      type === "category"
        ? { _id: id, _type: "category", title, slug: { _type: "slug", current: slugify(title) } }
        : { _id: id, _type: "author", name: title },
    );
  }
  return { _type: "reference", _ref: id };
}

const AUTHOR = { tr: "MİNADA Ekibi", en: "MİNADA Team" };

for (const p of posts) {
  docs.push({
    _id: `post-${p.language}-${p.slug}`,
    _type: "post",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    language: p.language,
    altSlug: p.altSlug,
    excerpt: p.excerpt,
    coverImage: await uploadCover(p.coverImage),
    category: refDoc("category", p.category),
    author: refDoc("author", p.author || AUTHOR[p.language]),
    publishedAt: `${p.publishedAt}T09:00:00.000Z`,
    body: p.blocks.map(toBlock),
    seo: {
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      keywords: p.keywords,
    },
  });
}

const words = (p) => p.blocks.reduce((n, b) => n + b.text.trim().split(/\s+/).length, 0);
const summary = posts
  .map((p) => `${p.language}/${p.slug}: ${words(p)} kelime, ${p.blocks.filter((b) => b.style === "h2").length} H2`)
  .join("\n");

// The same slugs were seeded earlier from lib/blog-2026-08.ts under a different
// _id scheme (s8-<lang>-<name>). Those docs are not overwritten by the ids below,
// and getPost() takes [0] of an unordered match, so leaving them in place would
// serve the old short draft or the new article at random and list each article
// twice. Match on slug rather than on the id prefix: that catches any legacy id
// scheme, and it leaves alone the blog-2026-08.ts drafts that have no file here
// yet. Sanity drafts are excluded so editor work in progress is never removed.
const seededSlugs = [...new Set(posts.map((p) => p.slug))];
const seededIds = docs.filter((d) => d._type === "post").map((d) => d._id);
const staleQuery = `*[_type == "post" && !(_id in path("drafts.**")) && slug.current in $slugs && !(_id in $ids)]`;
const staleParams = { slugs: seededSlugs, ids: seededIds };

if (dryRun) {
  console.log(summary);
  console.log(`\nDRY RUN — ${docs.length} doküman (${posts.length} yazı), hiçbir şey yazılmadı.`);
  process.exit(0);
}

// Sanity caps a single transaction; chunk to stay well under it.
for (let i = 0; i < docs.length; i += 25) {
  const chunk = docs.slice(i, i + 25);
  await chunk.reduce((t, d) => t.createOrReplace(d), client.transaction()).commit();
}

// Only after the new documents are safely in: a failed write must never leave
// the slug with nothing behind it.
const stale = await client.fetch(`${staleQuery}{_id}`, staleParams);
if (stale.length) {
  await client.delete({ query: staleQuery, params: staleParams });
  console.log(`Aynı slug'a sahip ${stale.length} eski doküman silindi: ${stale.map((d) => d._id).join(", ")}`);
}

console.log(summary);
console.log(
  `\nSeeded ${posts.length} posts (+${docs.length - posts.length} category/author docs) into ${projectId}/${dataset}.`,
);
