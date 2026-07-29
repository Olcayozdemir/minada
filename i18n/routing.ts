import { defineRouting } from "next-intl/routing";

// Locale-aware routing. Turkish is the default; English is fully supported.
// `pathnames` gives each page a localized, SEO-friendly slug per locale while
// the app folder uses the canonical (English) key as its directory name.
export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/services": { tr: "/hizmetler", en: "/services" },
    "/solutions": { tr: "/uygulama-alanlari", en: "/solutions" },
    "/cozumler/evim-icin": { tr: "/cozumler/evim-icin", en: "/solutions/for-home" },
    "/cozumler/isletmem-icin": { tr: "/cozumler/isletmem-icin", en: "/solutions/for-business" },
    "/hizmetler/gunes-enerjisi": { tr: "/hizmetler/gunes-enerjisi", en: "/services/solar-energy" },
    "/hizmetler/enerji-depolama": { tr: "/hizmetler/enerji-depolama", en: "/services/energy-storage" },
    "/hizmetler/isi-pompasi": { tr: "/hizmetler/isi-pompasi", en: "/services/heat-pump" },
    "/hizmetler/ev-sarj": { tr: "/hizmetler/ev-sarj", en: "/services/ev-charging" },
    "/urunler": { tr: "/urunler", en: "/products" },
    "/urunler/[category]": { tr: "/urunler/[category]", en: "/products/[category]" },
    "/how-it-works": { tr: "/nasil-calisir", en: "/how-it-works" },
    "/calculator": { tr: "/hesaplayici", en: "/calculator" },
    "/projects": { tr: "/referanslar", en: "/projects" },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/about": { tr: "/hakkimizda", en: "/about" },
    "/faq": { tr: "/sss", en: "/faq" },
    "/contact": { tr: "/iletisim", en: "/contact" },
    "/privacy": { tr: "/gizlilik", en: "/privacy" },
    "/cookies": { tr: "/cerez", en: "/cookies" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

// Static (non-parameterized) pathnames — safe to pass to <Link> as a string.
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;
