import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EnergyLine } from "@/components/marketing/EnergyLine";
import { Hero } from "@/components/marketing/Hero";
import { Intro } from "@/components/marketing/Intro";
import { Services } from "@/components/marketing/Services";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ApplicationAreas } from "@/components/marketing/ApplicationAreas";
import { CalculatorTeaser } from "@/components/marketing/CalculatorTeaser";
import { ProductsTeaser } from "@/components/marketing/ProductsTeaser";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FaqTeaser } from "@/components/marketing/FaqTeaser";
import { FinalCta } from "@/components/marketing/FinalCta";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildAlternates, localBusinessLd, faqLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: { absolute: t("homeTitle") },
    description: t("description"),
    alternates: buildAlternates("/", locale),
  };
}

const FAQ_IDS = ["cost", "payback", "warranty", "incentives"] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tf = await getTranslations({ locale, namespace: "Home.faq" });
  const faqItems = FAQ_IDS.map((id) => ({ q: tf(`${id}.q`), a: tf(`${id}.a`) }));

  return (
    <>
      <JsonLd data={localBusinessLd(locale)} />
      <JsonLd data={faqLd(faqItems)} />
      <EnergyLine>
        <Hero />
        <Intro />
        <Services />
        <HowItWorks />
        <ApplicationAreas />
        <CalculatorTeaser />
        <ProductsTeaser />
        <Testimonials />
        <FinalCta />
        <FaqTeaser />
      </EnergyLine>
    </>
  );
}
