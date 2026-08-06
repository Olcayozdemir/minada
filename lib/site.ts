import type { StaticPathname } from "@/i18n/routing";

// Primary navigation. `key` maps to the `Nav` message namespace; `href` is the
// canonical (localized) route from i18n/routing. An item with `columns`
// renders as a two-column mega dropdown (no href of its own).
export type NavLink = { href: StaticPathname; key: string };
export type NavColumn = { key: string; children: readonly NavLink[] };
export type NavItem = NavLink | { key: string; columns: readonly NavColumn[] };

// The four business lines (order = display order). `href` reused by nav+footer.
export const BUSINESS_LINES = [
  { id: "ges", href: "/hizmetler/gunes-enerjisi" },
  { id: "bess", href: "/hizmetler/enerji-depolama" },
  { id: "heatpump", href: "/hizmetler/isi-pompasi" },
  { id: "evcharge", href: "/hizmetler/ev-sarj" },
] as const satisfies ReadonlyArray<{ id: string; href: StaticPathname }>;

// Audience/use-case entries ("Sizin için").
export const AUDIENCES = [
  { id: "solutionsHome", href: "/cozumler/evim-icin" },
  { id: "solutionsBusiness", href: "/cozumler/isletmem-icin" },
] as const satisfies ReadonlyArray<{ id: string; href: StaticPathname }>;

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/", key: "home" },
  {
    key: "servicesGroup",
    columns: [
      {
        key: "navColLines",
        children: BUSINESS_LINES.map((l) => ({ href: l.href, key: `line_${l.id}` })),
      },
      {
        key: "navColFor",
        children: AUDIENCES.map((a) => ({ href: a.href, key: a.id })),
      },
    ],
  },
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
];

// GES offer types — live on /hizmetler/gunes-enerjisi (BESS is its own line now).
export const GES_TYPES = ["rooftop", "ground", "agripv", "carport"] as const;

// Contact + social. Phone + Instagram are real (Okan, 2026-07-11); email waits
// for the domain. WhatsApp number is read from env when available.
export const SITE = {
  name: "MİNADA",
  domain: "minada.com",
  email: "info@minada.com",
  phone: "+90 536 041 76 44",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905360417644",
  social: {
    instagram: "https://instagram.com/minadaenerji",
    linkedin: "https://linkedin.com/",
  },
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
