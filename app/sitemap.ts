import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getProductCategories } from "@/sanity/queries";
import { SITE_URL } from "@/lib/seo";

const HREFS = [
  "/",
  "/services",
  "/solutions",
  "/cozumler/evim-icin",
  "/cozumler/isletmem-icin",
  "/urunler",
  "/how-it-works",
  "/calculator",
  "/blog",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/cookies",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const href of HREFS) {
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
      languages[loc] = SITE_URL + getPathname({ href, locale: loc });
    }
    for (const loc of routing.locales) {
      entries.push({
        url: SITE_URL + getPathname({ href, locale: loc }),
        changeFrequency: "weekly",
        priority: href === "/" ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }

  // Localized catalog category pages (dynamic /urunler/[category] route).
  const catTpl = routing.pathnames["/urunler/[category]"] as Record<string, string>;
  const pathFor = (loc: string, slug: string) =>
    `/${loc}${catTpl[loc].replace("[category]", slug)}`;
  const categories = await getProductCategories();
  for (const cat of categories) {
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) languages[loc] = SITE_URL + pathFor(loc, cat.slug);
    for (const loc of routing.locales) {
      entries.push({
        url: SITE_URL + pathFor(loc, cat.slug),
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: { languages },
      });
    }
  }

  return entries;
}
