import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getPosts } from "@/sanity/queries";
import { SITE_URL } from "@/lib/seo";

const HREFS = [
  "/",
  "/services",
  "/solutions",
  "/cozumler/evim-icin",
  "/cozumler/isletmem-icin",
  "/hizmetler/gunes-enerjisi",
  "/hizmetler/enerji-depolama",
  "/hizmetler/isi-pompasi",
  "/hizmetler/ev-sarj",
  "/how-it-works",
  "/calculator",
  "/blog",
  "/about",
  "/projects",
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

  // Blog articles, per locale. Slugs differ between languages, so each post is
  // its own entry; hreflang pairing lives in the page's metadata (altSlug).
  for (const loc of routing.locales) {
    const posts = await getPosts(loc);
    for (const p of posts) {
      entries.push({
        url: `${SITE_URL}/${loc}/blog/${p.slug}`,
        lastModified: new Date(p.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
