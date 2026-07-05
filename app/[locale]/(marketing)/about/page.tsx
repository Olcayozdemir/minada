import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";
import { buildAlternates } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("about"), alternates: buildAlternates("/about", locale) };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Reference projects now live under About (no separate "Referanslar" nav tab).
  return <ReferencesSection locale={locale} />;
}
