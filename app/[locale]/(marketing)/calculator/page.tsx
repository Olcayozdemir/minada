import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Calculator } from "@/components/marketing/Calculator";
import { buildAlternates } from "@/lib/seo";
import { CITIES } from "@/lib/solar-config";
import styles from "@/components/marketing/Calculator.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Calculator" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildAlternates("/calculator", locale),
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ bill?: string; city?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const bill = typeof query.bill === "string" && Number.isFinite(Number(query.bill)) && Number(query.bill) > 0 ? query.bill : "1500";
  const city = CITIES.some((c) => c.id === query.city) ? query.city : "antalya";

  return (
    <Section tone="light" className={styles.page}>
      <Calculator initialBill={bill} initialCity={city} fromDemo={Boolean(query.bill)} />
    </Section>
  );
}
