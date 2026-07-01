import "@/styles/tokens.css";
import "@/styles/globals.scss";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import clsx from "clsx";
import { routing } from "@/i18n/routing";
import { fontBody, fontDisplay, fontSerif } from "@/lib/fonts";
import { GlassFilters } from "@/components/ui/GlassFilters";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_URL, organizationLd } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: "MİNADA Enerji",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      images: [{ url: "/og/og-default.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={clsx(fontDisplay.variable, fontSerif.variable, fontBody.variable)}
      data-scroll-behavior="smooth"
    >
      <body>
        <GlassFilters />
        <JsonLd data={organizationLd()} />
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
