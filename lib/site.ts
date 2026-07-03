import type { StaticPathname } from "@/i18n/routing";

// Primary navigation. `key` maps to the `Nav` message namespace; `href` is the
// canonical (localized) route from i18n/routing.
export const NAV_ITEMS: ReadonlyArray<{ href: StaticPathname; key: string }> = [
  { href: "/services", key: "services" },
  { href: "/solutions", key: "solutions" },
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/projects", key: "projects" },
  { href: "/about", key: "about" },
];

// Solar EPC service lines, in the order shown on the site (survey → O&M).
export const SERVICES = [
  "rooftop",
  "ground",
  "agripv",
  "carport",
  "bess",
  "engineering",
  "licensing",
  "procurement",
  "construction",
  "om",
] as const;

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
