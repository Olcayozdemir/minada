import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
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
  "/projects",
  "/blog",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/cookies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
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

  return entries;
}
