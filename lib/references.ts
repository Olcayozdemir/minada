import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { ProjectItem } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";

/** The two filters /referanslar offers. Commercial and industrial are one
    bucket: the client does not split them further. */
export type ReferenceCategory = "residential" | "business";

type CatalogEntry = {
  /** Sanity slug, or `local:<id>` for a photo that lives in public/. */
  key: string;
  title: string;
  location: string;
  category: ReferenceCategory;
  /** Installed DC power, kWp. No AC figure is shown anywhere. */
  systemKw: number;
  local?: { src: string; width: number; height: number };
};

/* The reference list as the client signed it off (Eray-Site-Notlar, 2026-09):
   businesses largest first, then homes, then the four photographs that came
   without a record, in the order the site already showed them. Names, powers
   and categories here override the CMS copy, which still carries older
   values; the Sanity record keeps supplying the photograph. A project added
   in the studio and missing here is appended after these, as published. */
export const REFERENCE_CATALOG: CatalogEntry[] = [
  { key: "merinos-kongre-merkezi-ges", title: "Merinos Kongre Merkezi GES", location: "Bursa", category: "business", systemKw: 4500 },
  { key: "hasat-plastik-ges", title: "Hasat Plastik GES", location: "Antalya", category: "business", systemKw: 1180 },
  { key: "inart-ges", title: "İnart GES", location: "Malatya", category: "business", systemKw: 941.76 },
  { key: "castle-hotel-ges", title: "Castle Otel GES", location: "Antalya", category: "business", systemKw: 174.05 },
  { key: "fidesan-ges", title: "Fidesan GES", location: "Antalya", category: "business", systemKw: 165.2 },
  { key: "basar-is-makineleri-ges", title: "Başar İş Makineleri GES", location: "Antalya", category: "business", systemKw: 53.1 },
  { key: "demre-zumrutkaya-ogrenci-dernegi-ges", title: "Demre Öğrenci Yurdu GES", location: "Antalya", category: "business", systemKw: 29.14 },
  { key: "mesken-ges-18-2", title: "Mesken GES", location: "Bodrum", category: "residential", systemKw: 18.2 },
  { key: "mesken-ges-04", title: "Mesken GES", location: "Antalya", category: "residential", systemKw: 13.02 },
  { key: "mesken-ges-03", title: "Mesken GES", location: "Antalya", category: "residential", systemKw: 12.98 },
  { key: "mesken-ges-02", title: "Mesken GES", location: "Antalya", category: "residential", systemKw: 11.88 },
  { key: "yuceal-insaat-nseb-ges", title: "Yüceal İnşaat nSEB GES", location: "Isparta", category: "residential", systemKw: 11.69 },
  { key: "mesken-ges-01", title: "Mesken GES", location: "Antalya", category: "residential", systemKw: 8.26 },
  { key: "mesken-ges-8-19", title: "Mesken GES", location: "Bodrum", category: "residential", systemKw: 8.19 },
  {
    key: "local:residential-tile-roof",
    title: "Mesken GES",
    location: "Antalya",
    category: "residential",
    systemKw: 13.64,
    local: { src: "/images/projects/residential-tile-roof.jpg", width: 1600, height: 1200 },
  },
  {
    key: "local:modern-villa-roof",
    title: "Mesken GES",
    location: "Antalya",
    category: "residential",
    systemKw: 22.32,
    local: { src: "/images/projects/modern-villa-roof.jpg", width: 1600, height: 1200 },
  },
  {
    key: "local:commercial-rooftop",
    title: "Katmer GES",
    location: "Antalya",
    category: "business",
    systemKw: 44.64,
    local: { src: "/images/projects/commercial-rooftop.jpg", width: 1600, height: 1200 },
  },
  {
    key: "local:petrol-station-canopy",
    title: "Akaryakıt İstasyonu GES",
    location: "Antalya",
    category: "business",
    systemKw: 40.84,
    local: { src: "/images/projects/petrol-station-canopy.jpg", width: 1600, height: 1200 },
  },
];

export type ReferenceItem = {
  id: string;
  title: string;
  location: string;
  category?: ReferenceCategory;
  /** Formatted DC power, e.g. "4.500,00 kWp"; empty when unknown. */
  power: string;
  image: { src: string; width: number; height: number } | null;
};

/** Always two decimals, in the reader's number format: "4.500,00 kWp" in
    Turkish, "4,500.00 kWp" in English. An unsupported locale falls back to
    the default: a stray path such as /wp-login.php reaches the page as its
    locale, and toLocaleString would throw a 500 before the layout's 404. */
export function formatKwp(kw: number, locale: string): string {
  const safe = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return `${kw.toLocaleString(safe, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWp`;
}

function categoryFromRecord(project: ProjectItem): ReferenceCategory | undefined {
  if (project.projectType === "residential") return "residential";
  if (project.projectType) return "business";

  // Locale-neutral lowercasing keeps English "Industrial" as an ASCII i.
  const excerpt = (project.excerpt ?? "").toLowerCase();
  if (["konut", "residential", "mesken", "villa"].some((w) => excerpt.includes(w))) {
    return "residential";
  }
  return excerpt ? "business" : undefined;
}

/**
 * The ordered reference list shared by the homepage strip and /referanslar.
 * `crop` sizes the Sanity cover; local photographs are served as they are.
 * Catalogued projects whose record (and so photograph) is missing are skipped.
 */
export function buildReferences(
  projects: ProjectItem[],
  locale: string,
  crop: { width: number; height: number },
): ReferenceItem[] {
  const bySlug = new Map(projects.map((p) => [p.slug, p] as const));
  const catalogued = new Set(REFERENCE_CATALOG.map((e) => e.key));
  const sanityImage = (project: ProjectItem) =>
    project.coverImage
      ? {
          src: urlFor(project.coverImage).width(crop.width).height(crop.height).fit("crop").auto("format").url(),
          width: crop.width,
          height: crop.height,
        }
      : null;

  const fromCatalog = REFERENCE_CATALOG.flatMap((entry): ReferenceItem[] => {
    const project = entry.local ? undefined : bySlug.get(entry.key);
    const image = entry.local ?? (project ? sanityImage(project) : null);
    if (!image) return [];
    return [
      {
        id: project?._id ?? entry.key,
        title: entry.title,
        location: entry.location,
        category: entry.category,
        power: formatKwp(entry.systemKw, locale),
        image,
      },
    ];
  });

  const uncatalogued = projects
    .filter((p) => !catalogued.has(p.slug))
    .map((p) => ({
      id: p._id,
      title: p.title,
      location: p.location ?? "",
      category: categoryFromRecord(p),
      power: p.systemKw ? formatKwp(p.systemKw, locale) : "",
      image: sanityImage(p),
    }));

  return [...fromCatalog, ...uncatalogued];
}
