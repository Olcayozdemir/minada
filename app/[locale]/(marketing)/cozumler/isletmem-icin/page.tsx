import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { IconActivity, IconCalculator, IconBuilding } from "@/components/ui/icons";
import { Services } from "@/components/marketing/Services";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import styles from "../segment.module.scss";

const BENEFITS = [
  { id: "b1", Icon: IconActivity },
  { id: "b2", Icon: IconCalculator },
  { id: "b3", Icon: IconBuilding },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Segments.business" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/cozumler/isletmem-icin", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Segments.business");
  const tc = await getTranslations("Common");

  return (
    <>
      <Section tone="dark">
        <SectionHeading
          as="h1"
          tone="dark"
          eyebrow={t("eyebrow")}
          title={t("title")}
          intro={t("intro")}
        />
        <ul className={styles.benefits}>
          {BENEFITS.map(({ id, Icon }) => (
            <li key={id} className={styles.benefit}>
              <span className={styles.benefitIcon}>
                <Icon size={22} />
              </span>
              <h2 className={styles.benefitTitle}>{t(`${id}.title`)}</h2>
              <p className={styles.benefitDesc}>{t(`${id}.desc`)}</p>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button href="/contact" size="lg" withArrow>
            {tc("getQuote")}
          </Button>
          <Button href="/about" size="lg" variant="glass">
            {t("referencesCta")}
          </Button>
        </div>
        <p className={styles.note}>{t("solutionsNote")}</p>
      </Section>

      {/* The five customer-facing solar offers — same section as the homepage. */}
      <Services />

      <FinalCta />
    </>
  );
}
