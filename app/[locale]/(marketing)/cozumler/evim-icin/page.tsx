import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { IconSolar, IconBolt, IconShield } from "@/components/ui/icons";
import { CalculatorTeaser } from "@/components/marketing/CalculatorTeaser";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import styles from "../segment.module.scss";

const BENEFITS = [
  { id: "b1", Icon: IconSolar },
  { id: "b2", Icon: IconBolt },
  { id: "b3", Icon: IconShield },
] as const;

// Summary of the six delivery steps — full detail lives on /how-it-works.
const STEP_IDS = ["discovery", "engineering", "licensing", "procurement", "install", "om"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Segments.home" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/cozumler/evim-icin", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Segments.home");
  const th = await getTranslations("Home.how");
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
          <Button href="/calculator" size="lg" variant="glass">
            {tc("calculate")}
          </Button>
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow={t("stepsEyebrow")}
          title={t("stepsTitle")}
          intro={t("stepsIntro")}
        />
        <ol className={styles.steps}>
          {STEP_IDS.map((id, i) => (
            <li key={id} className={styles.stepItem}>
              <span className={styles.stepNum}>{`0${i + 1}`}</span>
              {th(`${id}.title`)}
            </li>
          ))}
        </ol>
        <div className={styles.actions}>
          <Button href="/how-it-works" variant="secondary" withArrow>
            {t("stepsCta")}
          </Button>
        </div>
      </Section>

      <CalculatorTeaser />
      <Testimonials />
      <FinalCta />
    </>
  );
}
