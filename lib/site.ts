import type { StaticPathname } from "@/i18n/routing";

// Primary navigation. `key` maps to the `Nav` message namespace; `href` is the
// canonical (localized) route from i18n/routing. An item with `children`
// renders as a dropdown group (no href of its own).
export type NavLink = { href: StaticPathname; key: string };
export type NavItem = NavLink | { key: string; children: readonly NavLink[] };

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    key: "solutionsGroup",
    children: [
      { href: "/cozumler/evim-icin", key: "solutionsHome" },
      { href: "/cozumler/isletmem-icin", key: "solutionsBusiness" },
    ],
  },
  { href: "/urunler", key: "products" },
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/projects", key: "projects" },
  { href: "/calculator", key: "calculator" },
  { href: "/about", key: "about" },
];

// Customer-facing solar offers (process steps live on /how-it-works).
export const SERVICES = ["rooftop", "ground", "agripv", "carport", "bess"] as const;

// Contact + social. PLACEHOLDERS — real values arrive with the domain/email setup.
// WhatsApp number is read from env at build/runtime when available.
export const SITE = {
  name: "MİNADA",
  domain: "minada.com",
  email: "info@minada.com",
  phone: "+90 000 000 00 00",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "900000000000",
  social: {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
  },
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
