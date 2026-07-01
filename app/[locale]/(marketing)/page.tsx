import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/marketing/Hero";
import { Services } from "@/components/marketing/Services";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ApplicationAreas } from "@/components/marketing/ApplicationAreas";
import { CalculatorTeaser } from "@/components/marketing/CalculatorTeaser";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FaqTeaser } from "@/components/marketing/FaqTeaser";
import { FinalCta } from "@/components/marketing/FinalCta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <ApplicationAreas />
      <CalculatorTeaser />
      <Testimonials />
      <FaqTeaser />
      <FinalCta />
    </>
  );
}
