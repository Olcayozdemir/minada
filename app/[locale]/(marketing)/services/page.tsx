import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Services } from "@/components/marketing/Services";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.gateway" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildAlternates("/services", locale),
  };
}

// The five-door gateway as a standalone hub page (nav column titles link here).
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Services headingAs="h1" />
      <FinalCta />
    </>
  );
}
