import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FinalCta } from "@/components/marketing/FinalCta";
import { StatsBand } from "@/components/marketing/StatsBand";
import { RotatingSeal } from "@/components/marketing/RotatingSeal";
import { buildAlternates } from "@/lib/seo";
import styles from "./about.module.scss";

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

  return (
    <>
      {/* Page header, kinetic-type register: the night solar-farm render is
          masked by an organic curve sweeping into the light canvas, with the
          brand line spinning on a seal that rides the curve. The harbor word
          keeps the serif-italic gold treatment from the hero. */}
      <section className={styles.headerSection}>
        <svg className={styles.clips} aria-hidden="true" focusable="false">
          <defs>
            {/* Desktop: wavy right edge on the photo panel. */}
            <clipPath id="about-curve-r" clipPathUnits="objectBoundingBox">
              <path d="M0,0 H0.84 C0.62,0.16 1.04,0.36 0.8,0.56 C0.6,0.73 0.84,0.86 0.6,1 H0 Z" />
            </clipPath>
            {/* Mobile: wavy bottom edge on the full-width band. */}
            <clipPath id="about-curve-b" clipPathUnits="objectBoundingBox">
              <path d="M0,0 H1 V0.8 C0.74,0.98 0.52,0.72 0.3,0.88 C0.14,0.99 0.06,0.9 0,0.95 Z" />
            </clipPath>
          </defs>
        </svg>
        {/* The ring sits UNDER the masked photo (z 1 vs 2), so the curve's
            bulges occlude parts of the spinning line — the reference's depth
            trick. It surfaces in the white pockets and right of the panel. */}
        <RotatingSeal text={t("sealText")} className={styles.headerSeal} />
        <div className={styles.curveWrap}>
          <Image
            src="/images/v2/cta-mobile.jpeg"
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 44vw"
            className={styles.curveImg}
          />
        </div>
        <div className={styles.headerInner}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>{t("eyebrow")}</p>
            <h1 className={styles.title}>
              {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className={styles.lead}>{t("intro")}</p>
          </div>
        </div>
      </section>

      {/* Story — editorial split; the portrait photo balances two paragraphs. */}
      <Section tone="light" className={`${styles.storySection} ${styles.tight}`}>
        <div className={styles.story}>
          <div className={styles.storyText}>
            <h2 className={styles.h2}>{t("storyTitle")}</h2>
            <p>{t("storyP1")}</p>
            <p>{t("storyP2")}</p>
          </div>
          <figure className={styles.storyPhoto}>
            <Image
              src="/images/v2/about-story.jpg"
              alt={t("storyImageAlt")}
              width={1440}
              height={1929}
              sizes="(max-width: 900px) 92vw, 42vw"
            />
          </figure>
        </div>
      </Section>

      {/* Numbers — the page's dark beat (shared band, counts up on entry). */}
      <StatsBand />

      <Section tone="light" className={styles.tight}>
        <div className={styles.where}>
          <h2 className={styles.h2}>{t("whereTitle")}</h2>
          <p>{t("whereText")}</p>
          <p className={styles.cities}>{t("cities")}</p>
        </div>
      </Section>

      <Section tone="sand" className={styles.tight}>
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
      <Section tone="light" className={styles.tight}>
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

      <FinalCta namespace="About.finalCta" />
    </>
  );
}
