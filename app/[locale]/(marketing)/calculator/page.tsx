import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Calculator } from "@/components/marketing/Calculator";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Calculator");

  return (
    <Section tone="dark">
      <SectionHeading tone="dark" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <Calculator />
    </Section>
  );
}
