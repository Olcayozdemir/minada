import type { Metadata } from "next";
import Image from "next/image";
import clsx from "clsx";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { LineHero } from "@/components/marketing/LineHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import { GES_TYPES } from "@/lib/site";
import styles from "../line.module.scss";

// Kurulum tipi kart görselleri: çatı + arazi Üçay proje fotoğrafları,
// agri-pv mevcut Unsplash karesi, carport Wikimedia CC0 (bkz. public/images/ges/CREDITS.md).
const TYPE_IMAGES: Record<(typeof GES_TYPES)[number], string> = {
  rooftop: "/images/ges/ges-rooftop.jpg",
  ground: "/images/ges/ges-ground.jpg",
  agripv: "/images/v2/area-tarim-sulama.jpg",
  carport: "/images/ges/ges-carport.jpg",
};

// Eight questions no longer sit comfortably in one column — same two-column
// treatment the heat-pump page uses for its long list.
const GES_FAQ = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"] as const;

// nSEB: what the regulation asks of a new building, and the three things we
// do about it. Okan asked for the heading by name (Notion, 2026-09-03); the
// figures are the ones in the Binalarda Enerji Performansı Yönetmeliği, in
// force for buildings over 2.000 m² since 1 January 2025.
const NSEB = ["a", "b", "c"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Lines.ges" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/hizmetler/gunes-enerjisi", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lines.ges");

  return (
    <>
      <LineHero id="ges" namespace="Lines.ges" topic="ges" note={t("introNote")} />

      <Section tone="light">
        <SectionHeading title={t("typesTitle")} />
        <ul className={styles.grid2}>
          {GES_TYPES.map((id) => (
            <li key={id} className={clsx(styles.card, styles.mediaCard)}>
              <figure className={styles.mediaFig}>
                <Image
                  src={TYPE_IMAGES[id]}
                  alt={t(`types.${id}.alt`)}
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
              </figure>
              <div className={styles.mediaBody}>
                <h3 className={styles.cardTitle}>{t(`types.${id}.title`)}</h3>
                <p className={styles.cardDesc}>{t(`types.${id}.desc`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand">
        <SectionHeading title={t("nsebTitle")} intro={t("nsebIntro")} />
        <ul className={styles.trustGrid}>
          {NSEB.map((id) => (
            <li key={id}>
              <h3>{t(`nseb.${id}.title`)}</h3>
              <p>{t(`nseb.${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="light">
        <SectionHeading title={t("faqTitle")} />
        <ul className={clsx(styles.faq, styles.faqWide)}>
          {GES_FAQ.map((id) => (
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
