/**
 * Seeds reference projects into Sanity, in both locales.
 *
 * Source of truth: content/references.json — one entry per project. Shape:
 *   { source, slug, title, kind, location, systemKw, acKw, cover, publishedAt?,
 *     excerpt?: { tr, en } }
 *
 *   source     WeTransfer folder the photos came from. Repo-only bookkeeping,
 *              never published — it is how you tell which job a cover belongs
 *              to once residential titles are anonymised.
 *   slug       null for residential projects: derived from systemKw, matching
 *              the existing "mesken-ges-8-19" pattern.
 *   title      null for residential projects: becomes "Mesken GES", the site's
 *              existing convention for private customers.
 *   kind       one of KINDS below. Drives the excerpt in both locales, the way
 *              the current records read ("Endüstriyel çatı GES" /
 *              "Industrial rooftop PV"). Override with an explicit excerpt.
 *   location   province, e.g. "Malatya".
 *   systemKw   installed DC power in kWp.
 *   acKw       installed AC power in kWe.
 *   cover      filename inside the photo directory (see PHOTOS below).
 *   publishedAt  optional ISO date. Omitted, the file's order becomes the
 *              display order — /referanslar sorts by publishedAt desc.
 *
 * Covers live outside git (they are 4 MB drone frames and Sanity serves the
 * resized variants anyway). Drop them in content/reference-photos/, or point
 * elsewhere with PHOTOS=/some/dir.
 *
 * Usage (env comes from .env.local):
 *   node scripts/seed-references.mjs
 *   DRY_RUN=1 node scripts/seed-references.mjs   # validate + print, write nothing
 *
 * Idempotent: deterministic _id's (createOrReplace), safe to re-run. Refuses to
 * overwrite a project that is already in the dataset under a different source.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
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
const PHOTOS = process.env.PHOTOS || join(process.cwd(), "content", "reference-photos");

// Project kind -> the short type label both locales show under the title.
const KINDS = {
  "konut-cati": { tr: "Konut çatı GES", en: "Residential rooftop PV", projectType: "residential" },
  "endustriyel-cati": { tr: "Endüstriyel çatı GES", en: "Industrial rooftop PV", projectType: "industrial" },
  "ticari-cati": { tr: "Ticari çatı GES", en: "Commercial rooftop PV", projectType: "commercial" },
  arazi: { tr: "Arazi GES", en: "Ground-mount PV", projectType: "industrial" },
  carport: { tr: "Otopark GES", en: "Carport PV", projectType: "commercial" },
  tarim: { tr: "Tarımsal GES", en: "Agrivoltaic PV", projectType: "industrial" },
};

// Residential records are anonymous; the kWp keeps their slugs apart.
const RESIDENTIAL = "konut-cati";
const meskenSlug = (kw) => `mesken-ges-${String(kw).replace(".", "-")}`;

const entries = JSON.parse(readFileSync(join(process.cwd(), "content", "references.json"), "utf8"));

// Validate everything first, then report in one pass — filling these in is a
// single sit-down with the project list, not nine round trips.
const problems = [];
const gaps = [];
const resolved = [];
const seenSlugs = new Map();

entries.forEach((e, i) => {
  const where = `${i + 1}. ${e.source ?? "(source yok)"}`;
  const kind = e.kind;

  if (!kind) problems.push(`${where}: kind eksik — ${Object.keys(KINDS).join(" | ")}`);
  else if (!KINDS[kind]) problems.push(`${where}: kind "${kind}" tanınmıyor`);

  // location and systemKw are optional: the card drops the tag when either is
  // missing, so a project can go live on its photo and title alone. They are
  // still worth chasing, hence the closing report.
  if (!e.location) gaps.push(`${where}: location (il)`);
  if (typeof e.systemKw !== "number") gaps.push(`${where}: systemKw (kWp)`);

  // Residential slugs come from systemKw when it is known; without it the file
  // has to name one, because "Mesken GES" repeats across projects.
  const derivable = kind === RESIDENTIAL && typeof e.systemKw === "number";
  const slug = e.slug ?? (derivable ? meskenSlug(e.systemKw) : null);
  if (!slug) {
    problems.push(`${where}: slug eksik — systemKw yoksa elle verilmeli`);
  } else if (seenSlugs.has(slug)) {
    problems.push(`${where}: slug "${slug}" ${seenSlugs.get(slug)} ile çakışıyor`);
  } else {
    seenSlugs.set(slug, where);
  }

  const title = e.title ?? (kind === RESIDENTIAL ? "Mesken GES" : null);
  if (!title) problems.push(`${where}: title eksik`);

  const cover = e.cover ? join(PHOTOS, e.cover) : null;
  if (!cover) problems.push(`${where}: cover eksik (dosya adı)`);
  else if (!existsSync(cover)) problems.push(`${where}: kapak bulunamadı — ${cover}`);

  resolved.push({ ...e, kind, slug, title, coverPath: cover, index: i });
});

if (problems.length) {
  console.error(`content/references.json eksik — ${problems.length} madde:\n`);
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\nKapak klasörü: ${PHOTOS}`);
  process.exit(1);
}

if (!projectId && !dryRun) {
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set.");
  process.exit(1);
}
if (!token && !dryRun) {
  console.error("SANITY_API_WRITE_TOKEN is not set (Editor token from sanity.io/manage).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// createOrReplace overwrites silently, and a residential slug is just its kWp —
// a 18.2 kWp roof would land on the Bodrum record already on the site. Same
// slug in the same province is this script's own earlier run; anything else is
// a different project and stops us.
if (!dryRun) {
  const existing = await client.fetch(`*[_type == "projectReference"]{"slug": slug.current, location}`);
  const claimed = new Map(existing.map((d) => [d.slug, d.location ?? null]));
  const clashes = resolved.filter((r) => claimed.has(r.slug) && claimed.get(r.slug) !== r.location);
  if (clashes.length) {
    console.error("Bu slug'lar veri setinde başka bir projeye ait, üzerine yazılmayacak:\n");
    for (const c of clashes) console.error(`  · ${c.slug}  →  ${claimed.get(c.slug)} (gelen: ${c.location})`);
    console.error("\nsystemKw değerlerini doğrula ya da slug'ı elle ver.");
    process.exit(1);
  }
}

// No publishedAt: keep the file's order as the page order (publishedAt desc),
// on a fixed base so re-runs don't reshuffle the grid.
const BASE = Date.parse("2026-08-14T12:00:00.000Z");
const fallbackDate = (i) => new Date(BASE - i * 60_000).toISOString();

const docs = [];
let uploads = 0;

for (const r of resolved) {
  let coverImage;
  if (dryRun) {
    coverImage = { _type: "image", asset: { _type: "reference", _ref: `dry-${basename(r.coverPath)}` } };
  } else {
    const asset = await client.assets.upload("image", createReadStream(r.coverPath), {
      filename: basename(r.coverPath),
    });
    coverImage = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  }
  uploads++;

  const publishedAt = r.publishedAt ?? fallbackDate(r.index);
  for (const lang of ["tr", "en"]) {
    docs.push({
      _id: `projectReference-${r.slug}-${lang}`,
      _type: "projectReference",
      title: r.title,
      slug: { _type: "slug", current: r.slug },
      language: lang,
      ...(r.location ? { location: r.location } : {}),
      ...(typeof r.systemKw === "number" ? { systemKw: r.systemKw } : {}),
      ...(typeof r.acKw === "number" ? { acKw: r.acKw } : {}),
      projectType: KINDS[r.kind].projectType,
      excerpt: r.excerpt?.[lang] ?? KINDS[r.kind][lang],
      coverImage,
      publishedAt,
    });
  }
}

const summary = `${resolved.length} projects, ${docs.length} docs, ${uploads} covers`;

const report = () => {
  if (!gaps.length) return;
  console.log(`\nEksik — ${gaps.length} alan (kart o etiketi basmıyor):`);
  for (const g of gaps) console.log(`  · ${g}`);
};

if (dryRun) {
  console.log(`DRY RUN — ${summary}. Nothing written.`);
  console.log("Sample doc:\n" + JSON.stringify(docs[0], null, 2));
  report();
  process.exit(0);
}

const tx = docs.reduce((t, d) => t.createOrReplace(d), client.transaction());
await tx.commit();
console.log(`Seeded into ${projectId}/${dataset}: ${summary}.`);
report();
