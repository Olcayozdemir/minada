import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CalculatorTeaser } from "@/components/marketing/CalculatorTeaser";
// import { Testimonials } from "@/components/marketing/Testimonials"; // askıda — gerçek referanslar gelince
import { buildAlternates } from "@/lib/seo";
import styles from "../segment.module.scss";

const GAINS = ["g1", "g2", "g3"] as const;

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
      {/* Foto hero — kamp sayfası kalıbı; aydınlık gün ışığı görseli. */}
      <section className={styles.pHero} data-hero="">
        <Image
          src="/images/v2/home-hero.jpeg"
          alt=""
          fill
          sizes="100vw"
          priority
          className={styles.pHeroPhoto}
        />
        <div className={styles.pHeroScrim} aria-hidden="true" />
        <div className={styles.pHeroInner}>
          <p className={styles.pEyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.pTitle}>{t("title")}</h1>
          <p className={styles.pIntro}>{t("intro")}</p>
          <div className={styles.actions}>
            <Button href={{ pathname: "/contact", query: { konu: "ges" } }} size="lg" withArrow>
              {tc("getQuote")}
            </Button>
            <Button href="/calculator" size="lg" variant="glass">
              {tc("calculate")}
            </Button>
          </div>
        </div>
      </section>

      {/* Kazanç — büyük altın istatistikler. */}
      <Section tone="light">
        <SectionHeading
          eyebrow={t("gains.eyebrow")}
          title={t("gains.title")}
          intro={t("gains.intro")}
        />
        <ul className={styles.gains}>
          {GAINS.map((id) => (
            <li key={id} className={styles.gainCard}>
              <span className={styles.gainStat}>{t(`gains.${id}.stat`)}</span>
              <h3 className={styles.gainTitle}>{t(`gains.${id}.title`)}</h3>
              <p className={styles.gainDesc}>{t(`gains.${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand">
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

      {/* Çapraz satış: GES'in yanına eklenebilecek iş kolları (Okan, 7.07). */}
      <Section tone="light">
        <SectionHeading title={t("cross.title")} intro={t("cross.intro")} />
        <div className={styles.crossRow}>
          <Button href="/hizmetler/isi-pompasi" variant="secondary" withArrow>
            {t("cross.heatpump")}
          </Button>
          <Button href="/hizmetler/ev-sarj" variant="secondary" withArrow>
            {t("cross.evcharge")}
          </Button>
          <Button href="/hizmetler/enerji-depolama" variant="secondary" withArrow>
            {t("cross.bess")}
          </Button>
        </div>
      </Section>

      <CalculatorTeaser />
      {/* <Testimonials /> — askıda, gerçek referanslarla geri gelecek. */}

      <Section tone="dark">
        <div className={`${styles.ctaRow} ${styles.ctaRowDark}`}>
          <div>
            <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
            <p className={styles.ctaDesc}>{t("ctaDesc")}</p>
          </div>
          <Button href={{ pathname: "/contact", query: { konu: "ges" } }} size="lg" withArrow>
            {tc("getQuote")}
          </Button>
        </div>
      </Section>
    </>
  );
}
