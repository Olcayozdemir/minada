import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.how" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildAlternates("/how-it-works", locale),
  };
}

// The six-step delivery process, survey → O&M.
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <HowItWorks headingAs="h1" />
      <FinalCta />
    </>
  );
}
