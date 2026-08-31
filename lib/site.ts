import type { StaticPathname } from "@/i18n/routing";

// Primary navigation. `key` maps to the `Nav` message namespace; `href` is the
// canonical (localized) route from i18n/routing. An item with `columns`
// renders as a two-column mega dropdown (no href of its own).
export type NavLink = { href: StaticPathname; key: string };
export type NavColumn = { key: string; children: readonly NavLink[] };
export type NavItem = NavLink | { key: string; columns: readonly NavColumn[] };

// The four business lines (order = display order). `href` reused by nav+footer;
// `art` is the isometric diorama render (alpha PNG, client asset), shared by
// the homepage gateway card and the line page's own hero. One source matters
// here beyond tidiness: the two are morphed into each other on navigation, and
// a shared element that is not the same picture reads as a glitch.
export const BUSINESS_LINES = [
  { id: "ges", href: "/hizmetler/gunes-enerjisi", art: "/images/v2/service-solar.png" },
  { id: "bess", href: "/hizmetler/enerji-depolama", art: "/images/v2/service-battery.png" },
  { id: "heatpump", href: "/hizmetler/isi-pompasi", art: "/images/v2/service-heatpump.png" },
  { id: "evcharge", href: "/hizmetler/ev-sarj", art: "/images/v2/service-ev.png" },
] as const satisfies ReadonlyArray<{ id: string; href: StaticPathname; art: string }>;

/** Every diorama render is authored at this size. */
export const LINE_ART = { w: 1920, h: 1434 } as const;

/** The view-transition identity a line's diorama carries across routes. */
export const lineArtName = (id: string) => `line-art-${id}`;

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

// Contact + social. Telefon 2026-08-06'da güncellendi (Olcay); Instagram gerçek
// (Okan, 2026-07-11); e-posta posta kutusu kurulumunu bekliyor. WhatsApp numarası
// env ile override edilebilir, varsayılan aynı hattır.
//
// Alan adı .com.tr: minada.com bizim değil (2003'te kaydedilmiş, eName'de, park
// sayfası dönüyor). Üretimde bağlı olan ve DNS'i Vercel'de duran minada.com.tr.
export const SITE = {
  name: "MİNADA",
  domain: "minada.com.tr",
  email: "info@minada.com.tr",
  phone: "+90 505 146 30 11",
  // Adres Notion 06.08 notundan (Okan/Olcay).
  address: "Görgü Mah. 2. Sk., Ankara Asfaltı 15. Km, 44900 Yeşilyurt / Malatya",
  addressMapUrl:
    "https://www.google.com/maps/place//data=!4m2!3m1!1s0x40762d71b98a0df1:0xb9974f2de8840182",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905051463011",
  social: {
    instagram: "https://instagram.com/minadaenerji",
    // Şirket sayfası açılana kadar boş: dolduğu anda footer ikonu ve JSON-LD
    // sameAs'ı geri gelir (seo.ts filter(Boolean) ile eliyor).
    linkedin: "",
  },
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
