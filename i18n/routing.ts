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
    "/how-it-works": { tr: "/nasil-calisir", en: "/how-it-works" },
    "/calculator": { tr: "/hesaplayici", en: "/calculator" },
    "/projects": { tr: "/referanslar", en: "/projects" },
    "/blog": "/blog",
    "/about": { tr: "/hakkimizda", en: "/about" },
    "/faq": { tr: "/sss", en: "/faq" },
    "/contact": { tr: "/iletisim", en: "/contact" },
    "/privacy": { tr: "/gizlilik", en: "/privacy" },
    "/cookies": { tr: "/cerez", en: "/cookies" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
