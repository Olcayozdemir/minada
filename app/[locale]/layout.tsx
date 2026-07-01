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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://minada.com"),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
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
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
