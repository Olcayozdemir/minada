import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type StaticPathname } from "@/i18n/routing";
import { SITE } from "@/lib/site";

// Varsayılan da üretimdeki alan adı olmalı: env eksik kaldığında canonical ve
// sitemap bizim olmayan bir alan adını işaret ediyordu (minada.com bir park
// sayfası), yani Google'a "asıl sayfa orada" deniyordu.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minada.com.tr";

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

/** Canonical + hreflang for a blog article whose slug differs per locale. */
export function articleAlternates(
  locale: string,
  slug: string,
  altSlug?: string,
): NonNullable<Metadata["alternates"]> {
  const url = (loc: string, s: string) => `${SITE_URL}/${loc}/blog/${s}`;
  const other = routing.locales.find((l) => l !== locale);
  const languages: Record<string, string> = { [locale]: url(locale, slug) };
  if (other && altSlug) languages[other] = url(other, altSlug);
  languages["x-default"] =
    locale === routing.defaultLocale
      ? url(routing.defaultLocale, slug)
      : (languages[routing.defaultLocale] ?? url(locale, slug));
  return { canonical: url(locale, slug), languages };
}

/** BlogPosting schema for an article page. */
export function articleLd(a: {
  locale: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  publishedAt: string;
  authorName?: string;
  keywords?: string[];
}) {
  const url = `${SITE_URL}/${a.locale}/blog/${a.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    image: a.image ? [a.image] : [`${SITE_URL}/og/og-default.png`],
    datePublished: a.publishedAt,
    dateModified: a.publishedAt,
    inLanguage: a.locale,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: a.authorName || "MİNADA Enerji" },
    publisher: {
      "@type": "Organization",
      name: "MİNADA Enerji",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo/minada-mark.svg` },
    },
    ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
  };
}

/** Breadcrumb trail: Ana sayfa → Blog → yazı. */
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
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
