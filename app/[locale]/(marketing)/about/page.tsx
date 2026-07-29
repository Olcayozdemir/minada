import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";
import { buildAlternates } from "@/lib/seo";
import styles from "./about.module.scss";

export const revalidate = 60;

const STATS = ["years", "projects", "capacity", "solutions"] as const;
const VALUES = ["discipline", "transparency", "oneHand", "promise", "longTerm"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/about", locale),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const tc = await getTranslations("Common");

  return (
    <>
      {/* Page header — the harbor line carries the brand metaphor, so the
          accent word gets the serif-italic gold treatment from the hero. */}
      <Section tone="light">
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>
            {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
          </h1>
          <p className={styles.lead}>{t("intro")}</p>
        </div>
      </Section>

      {/* Story — editorial split; the portrait photo balances two paragraphs. */}
      <Section tone="light" className={styles.storySection}>
        <div className={styles.story}>
          <div className={styles.storyText}>
            <h2 className={styles.h2}>{t("storyTitle")}</h2>
            <p>{t("storyP1")}</p>
            <p>{t("storyP2")}</p>
          </div>
          <figure className={styles.storyPhoto}>
            <Image
              src="/images/v2/area-ticari.jpg"
              alt={t("storyImageAlt")}
              width={1434}
              height={1920}
              sizes="(max-width: 900px) 92vw, 42vw"
            />
          </figure>
        </div>
      </Section>

      {/* Numbers — the page's dark beat. Labels live in <dt>, values in <dd>;
          the visual order (value first) is flipped in CSS. */}
      <Section tone="dark">
        <SectionHeading tone="dark" title={t("statsTitle")} />
        <dl className={styles.stats}>
          {STATS.map((k) => (
            <div key={k} className={styles.stat}>
              <dt className={styles.statLabel}>{t(`stats.${k}.label`)}</dt>
              <dd className={styles.statValue}>
                {t(`stats.${k}.value`)}
                {t(`stats.${k}.suffix`) ? <span>{t(`stats.${k}.suffix`)}</span> : null}
              </dd>
              {t.has(`stats.${k}.sub`) ? (
                <dd className={styles.statSub}>{t(`stats.${k}.sub`)}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="light">
        <div className={styles.where}>
          <h2 className={styles.h2}>{t("whereTitle")}</h2>
          <p>{t("whereText")}</p>
          <p className={styles.cities}>{t("cities")}</p>
        </div>
      </Section>

      <Section tone="sand">
        <div className={styles.pair}>
          <div className={styles.pairItem}>
            <h2 className={styles.h2}>{t("missionTitle")}</h2>
            <p>{t("missionText")}</p>
          </div>
          <div className={styles.pairItem}>
            <h2 className={styles.h2}>{t("visionTitle")}</h2>
            <p>{t("visionText")}</p>
          </div>
        </div>
      </Section>

      {/* Values — a manifesto list, not a card grid: term column + rule rows. */}
      <Section tone="light">
        <SectionHeading title={t("valuesTitle")} />
        <dl className={styles.values}>
          {VALUES.map((k) => (
            <div key={k} className={styles.value}>
              <dt>{t(`values.${k}.term`)}</dt>
              <dd>{t(`values.${k}.desc`)}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Reference projects keep living on this page (no separate nav tab). */}
      <ReferencesSection locale={locale} />

      <Section tone="band">
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
          <p className={styles.ctaDesc}>{t("ctaDesc")}</p>
          <div className={styles.ctaActions}>
            <Button href="/contact" size="lg" withArrow>
              {tc("getQuote")}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
