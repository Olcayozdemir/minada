/**
 * Seeds the product catalog (docs/katalog-seed.md) into Sanity.
 *
 * Usage:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx NEXT_PUBLIC_SANITY_DATASET=production \
 *   SANITY_API_WRITE_TOKEN=sk... npm run seed:products
 *
 * - Idempotent: deterministic _id's (createOrReplace), safe to re-run.
 * - Images are intentionally left empty (no hotlinking from cw-enerji.com);
 *   upload visuals via the Studio afterwards.
 * - Easy Life / portable / accessory groups are seeded with hidden: true
 *   (off-showcase per IA plan v1); flip the flag in the Studio to show them.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

// DRY_RUN=1 builds and prints the documents without a token/write — lets you
// validate the transform offline before hitting the real dataset.
const dryRun = Boolean(process.env.DRY_RUN);

const slugify = (s) =>
  s
    .toLowerCase()
    .replaceAll("ç", "c").replaceAll("ğ", "g").replaceAll("ı", "i")
    .replaceAll("ö", "o").replaceAll("ş", "s").replaceAll("ü", "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CATEGORY = {
  _id: "productCategory-gunes-panelleri",
  _type: "productCategory",
  title: "Güneş Panelleri",
  slug: { _type: "slug", current: "gunes-panelleri" },
  order: 1,
};

const BRANDS = [
  { _id: "productBrand-cw-enerji", _type: "productBrand", title: "CW Enerji" },
  { _id: "productBrand-tommatech", _type: "productBrand", title: "TommaTech" },
];

// [brandId, title, powerRange, variants, warrantyProductYears, warrantyPerformanceYears, features, hidden]
const F_STD = ["topcon", "lowLight", "positiveTolerance", "selfClean"];
const G2G = ["g2g"];

const GROUPS = [
  // ── CW Enerji (12) ──
  ["cw-enerji", "M12 132TNBR G2G TOPCon", "655–620 Wp", ["655","650","645","640","635","630","625","620"], 12, 30, [...G2G, ...F_STD]],
  ["cw-enerji", "M12 132TNR TOPCon", "655–620 Wp", ["655","650","645","640","635","630","625","620"], null, 30, F_STD],
  ["cw-enerji", "M12 108TNBR TOPCon", "535–510 Wp", ["535","530","525","520","515","510"], null, 30, F_STD],
  ["cw-enerji", "M12 132TNB TOPCon", "755–715 Wp", ["755","750","745","740","735","730","725","720","715"], 12, 30, F_STD],
  ["cw-enerji", "M12 132TNB G2G TOPCon", "755–715 Wp", ["755","750","745","740","735","730","725","720","715"], 12, 30, [...G2G, ...F_STD]],
  ["cw-enerji", "M10 144TNB G2G TOPCon", "620–590 Wp", ["620","615","610","605","600","595","590"], 12, 30, [...G2G, ...F_STD]],
  ["cw-enerji", "M10 144TNB TOPCon", "620–590 Wp", ["620","615","610","605","600","590"], 12, 30, F_STD],
  ["cw-enerji", "M10 144TN TOPCon", "620–590 Wp", ["620","615","610","605","600","595","590"], 12, 30, F_STD],
  ["cw-enerji", "M10 144TNFB TOPCon Black Series", "620–590 Wp", ["620","615","610","605","600","595","590"], 12, 30, ["fullBlack", ...F_STD]],
  ["cw-enerji", "M10 108TN TOPCon", "455–420 Wp", ["455","450","445","440","435","430","425","420"], 12, 30, F_STD],
  ["cw-enerji", "M10 108TNB G2G TOPCon", "450–435 Wp", ["450","445","440","435","430","425","420"], 12, 30, [...G2G, ...F_STD]],
  ["cw-enerji", "M10 108TNB TOPCon", "450–420 Wp", ["450","445","440","435","430","425","420"], 12, 30, F_STD],
  // ── TommaTech (25) ──
  ["tommatech", "M12 132TNBR G2G TOPCon", "655–620 Wp", ["655","650","645","640","635","630","625","620"], 15, 30, [...G2G, ...F_STD]],
  ["tommatech", "M12 132TNBR TOPCon", "655–620 Wp", ["655","650","645","640","635","630","625","620"], 15, 30, F_STD],
  ["tommatech", "M12 108TNBR TOPCon", "535–510 Wp", ["535","530","525","520","515","510"], null, 30, F_STD],
  ["tommatech", "M12 132TNB G2G TOPCon", "755–720 Wp", ["755","750","745","740","735","730","725","720"], 15, 30, [...G2G, ...F_STD]],
  ["tommatech", "M12 132TNB TOPCon", "755–720 Wp", ["755","750","745","740","735","730","725","720"], 15, 30, F_STD],
  ["tommatech", "M12 132TNB G2G Diamond Plus", "900–860 Wp (bifacial)", ["900","895","890","885","880","870","865","860"], 15, 30, ["bifacial", ...G2G, ...F_STD]],
  ["tommatech", "M12 108TNB G2G Diamond Plus", "745–715 Wp (bifacial)", ["745","740","735","730","725","720","715"], 15, 30, ["bifacial", ...G2G, ...F_STD]],
  ["tommatech", "M10 144TNB Diamond Plus", "745–715 Wp (bifacial)", ["745","740","735","730","725","720","715"], 15, 30, ["bifacial", ...F_STD]],
  ["tommatech", "M12 108TN Diamond Plus", "625–610 Wp", ["625","620","615","610"], 15, 30, F_STD],
  ["tommatech", "Easy Life 15Wp Mobil Solar Şarj", "15 Wp", ["15"], null, null, ["portable"], true],
  ["tommatech", "Easy Life Taşınabilir", "200–150 W", ["200","150"], null, null, ["portable"], true],
  ["tommatech", "170-110Wp Flexible Dark Series", "170–110 Wp", ["170","110"], 2, null, ["flexible", "fullBlack"], true],
  ["tommatech", "Easy Life 25Wp Katlanabilir", "25 Wp", ["25"], null, null, ["portable"], true],
  ["tommatech", "Easy Life 110Wp Katlanabilir", "110 Wp", ["110"], null, null, ["portable"], true],
  ["tommatech", "Easy Life Omuz Askısı (aksesuar)", "", [], null, null, ["portable"], true],
  ["tommatech", "170-110Wp Flexible Serisi", "170–110 Wp", ["170","110"], 2, null, ["flexible"], true],
  ["tommatech", "400-240Wp BIPV", "400–240 Wp", ["400","320","240"], 30, 30, ["bipv", ...F_STD]],
  ["tommatech", "M10 108TN TOPCon", "455–420 Wp", ["455","450","445","440","435","430","425","420"], 15, 30, F_STD],
  ["tommatech", "M10 108TNFB TopCon Dark Series", "455–420 Wp", ["455","450","445","440","435","430","425","420"], 15, 30, ["fullBlack", ...F_STD]],
  ["tommatech", "M10 108TNB TOPCon", "455–420 Wp", ["455","450","445","440","435","430","425","420"], 15, 30, F_STD],
  ["tommatech", "M10 108TNB TOPCon G2G", "455–420 Wp", ["455","450","445","440","435","430","425","420"], 15, 30, [...G2G, ...F_STD]],
  ["tommatech", "M10 144TN TOPCon", "620–590 Wp", ["620","615","610","605","600","595","590"], 15, 30, F_STD],
  ["tommatech", "M10 144TNFB TOPCon Dark Series", "620–590 Wp", ["620","615","610","605","600","595","590"], 15, 30, ["fullBlack", ...F_STD]],
  ["tommatech", "M10 144TNB TOPCon", "620–600 Wp", ["620","615","610","605","600","595","590"], 15, 30, F_STD],
  ["tommatech", "M10 144TNB G2G TOPCon", "620–590 Wp", ["620","615","610","605","600","595","590"], 15, 30, [...G2G, ...F_STD]],
];

// Build the full document set. `variants` are coerced to numbers to match the
// productGroup schema (array of number) — seeding strings would flag in Studio.
function buildDocs() {
  const docs = [CATEGORY, ...BRANDS];
  GROUPS.forEach((g, i) => {
    const [brand, title, powerRange, variants, wProd, wPerf, features, hidden] = g;
    const slug = slugify(`${brand}-${title}`);
    docs.push({
      _id: `productGroup-${slug}`,
      _type: "productGroup",
      title,
      slug: { _type: "slug", current: slug },
      category: { _type: "reference", _ref: CATEGORY._id },
      brand: { _type: "reference", _ref: `productBrand-${brand}` },
      powerRange: powerRange || undefined,
      variants: variants.map(Number),
      ...(wProd ? { warrantyProductYears: wProd } : {}),
      ...(wPerf ? { warrantyPerformanceYears: wPerf } : {}),
      features,
      featured: false,
      hidden: Boolean(hidden),
      order: i + 1,
    });
  });
  return docs;
}

async function run() {
  const docs = buildDocs();
  const groups = docs.filter((d) => d._type === "productGroup");

  if (dryRun) {
    const hidden = groups.filter((g) => g.hidden).length;
    console.log(
      `DRY RUN — ${docs.length} docs: 1 category, ${BRANDS.length} brands, ` +
        `${groups.length} groups (${groups.length - hidden} vitrinde, ${hidden} gizli).`,
    );
    console.log("Örnek grup:\n" + JSON.stringify(groups[0], null, 2));
    return;
  }

  if (!projectId || !token) {
    console.error(
      "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are required. " +
        "(Tip: DRY_RUN=1 to preview offline.)",
    );
    process.exit(1);
  }

  const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });
  let tx = client.transaction();
  for (const d of docs) tx = tx.createOrReplace(d);
  const res = await tx.commit();
  console.log(`Seeded ${res.results.length} documents into ${projectId}/${dataset}.`);
  console.log("Not: görselleri Studio'dan yükleyin (hotlink kullanılmıyor).");
}

run().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
