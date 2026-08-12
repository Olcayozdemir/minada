import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FinalCta } from "@/components/marketing/FinalCta";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";
import { buildAlternates } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/projects", locale),
  };
}

// "Referanslar" is its own tab again: the gallery opens the page (h1) instead
// of trailing the About page, so the two nav items no longer share a route.
export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ReferencesSection locale={locale} as="h1" />
      <FinalCta />
    </>
  );
}
