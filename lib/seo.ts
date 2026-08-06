import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type StaticPathname } from "@/i18n/routing";
import { SITE } from "@/lib/site";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minada.com";

type Locale = (typeof routing.locales)[number];

/** Canonical + hreflang alternates for a localized route. */
export function buildAlternates(href: StaticPathname, locale: string): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = SITE_URL + getPathname({ href, locale: loc });
  }
  languages["x-default"] = SITE_URL + getPathname({ href, locale: routing.defaultLocale });
  return {
    canonical: SITE_URL + getPathname({ href, locale: locale as Locale }),
    languages,
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MİNADA Enerji",
    url: SITE_URL,
    logo: `${SITE_URL}/logo/minada-mark.svg`,
    sameAs: [SITE.social.instagram, SITE.social.linkedin].filter(Boolean),
  };
}

export function localBusinessLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "MİNADA Enerji",
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/og/og-default.png`,
    telephone: SITE.phone,
    email: SITE.email,
    areaServed: "TR",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Görgü Mah. 2. Sk., Ankara Asfaltı 15. Km",
      addressLocality: "Yeşilyurt",
      addressRegion: "Malatya",
      postalCode: "44900",
      addressCountry: "TR",
    },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
