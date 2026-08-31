import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { LineHero } from "@/components/marketing/LineHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FinalCta } from "@/components/marketing/FinalCta";
import { BessFlow } from "@/components/marketing/BessFlow";
import { buildAlternates } from "@/lib/seo";
import styles from "../line.module.scss";

/* The section's whole point is size, so each tier is drawn as its own diorama
   with the same 1.75 m figure standing in it: shoulder-height beside the wall
   unit, level with the cabinets, a speck at the foot of the containers. Read
   across the three cards the figure shrinks, which is the comparison the
   numbers underneath only state. */
const BESS_SCALES = ["home", "ci", "utility"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Lines.bess" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/hizmetler/enerji-depolama", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lines.bess");

  return (
    <>
      <LineHero id="bess" namespace="Lines.bess" topic="depolama" below={<BessFlow />} />

      <Section tone="light">
        <SectionHeading title={t("scalesTitle")} intro={t("scalesIntro")} />
        <ul className={styles.grid3}>
          {BESS_SCALES.map((id) => (
            <li key={id} className={styles.card}>
              <Image
                src={`/images/v2/bess-${id}-iso.jpg`}
                alt=""
                width={1200}
                height={896}
                sizes="(max-width: 700px) 92vw, (max-width: 1000px) 46vw, (max-width: 1200px) 31vw, 350px"
                className={styles.cardArt}
              />
              <h3 className={styles.cardTitle}>{t(`scales.${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`scales.${id}.desc`)}</p>
              <ul className={styles.cardList}>
                {(["b1", "b2", "b3"] as const).map((b) => (
                  <li key={b}>{t(`scales.${id}.${b}`)}</li>
                ))}
              </ul>
              <p className={styles.cardFoot}>{t(`scales.${id}.scale`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand">
        <SectionHeading title={t("techTitle")} />
        <div className={styles.proseCols}>
          <div>
            <h3>{t("tech.t1")}</h3>
            <p>{t("tech.p1")}</p>
          </div>
          <div>
            <h3>{t("tech.t2")}</h3>
            <p>{t("tech.p2")}</p>
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className={styles.productRow}>
          <SectionHeading title={t("productsTitle")} />
        </div>
        <ul className={styles.faq}>
          {(["f1", "f2"] as const).map((id) => (
            <li key={id} className={styles.faqItem}>
              <p className={styles.faqQ}>{t(`${id}.q`)}</p>
              <p className={styles.faqA}>{t(`${id}.a`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta />
    </>
  );
}
