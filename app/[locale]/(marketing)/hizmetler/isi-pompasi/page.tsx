import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { LineHero } from "@/components/marketing/LineHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import styles from "../line.module.scss";

/* Each type is drawn as a cutaway, because what separates them is where the
   heat comes from: outside air, groundwater, a buried loop, the pool itself.
   That lives below or beside the building, so the plinth is cut open. */
const HP_TYPES = ["air", "water", "geo", "pool"] as const;
const HP_ADVANTAGES = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"] as const;
const HP_FAQ = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Lines.heatpump" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/hizmetler/isi-pompasi", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lines.heatpump");

  return (
    <>
      <LineHero id="heatpump" namespace="Lines.heatpump" topic="isi-pompasi">
      </LineHero>

      <Section tone="light">
        <div className={styles.proseCols}>
          <div>
            <h3>{t("what.title")}</h3>
            <p>{t("what.p1")}</p>
          </div>
          <div>
            <h3>{t("how.title")}</h3>
            <p>{t("how.p1")}</p>
            <div className={styles.miniChips}>
              <span>{t("how.i1")}</span>
              <span>{t("how.i2")}</span>
              <span>{t("how.i3")}</span>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeading title={t("typesTitle")} />
        <ul className={styles.grid2}>
          {HP_TYPES.map((id) => (
            <li key={id} className={styles.card}>
              <Image
                src={`/images/v2/hp-${id}-iso.jpg`}
                alt=""
                width={1200}
                height={896}
                sizes="(max-width: 760px) 92vw, (max-width: 1400px) 46vw, 645px"
                quality={90}
                className={styles.cardArt}
              />
              <h3 className={styles.cardTitle}>{t(`types.${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`types.${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="light">
        <SectionHeading title={t("advTitle")} />
        <ul className={styles.checkGrid}>
          {HP_ADVANTAGES.map((id) => (
            <li key={id}>{t(`adv.${id}`)}</li>
          ))}
        </ul>
      </Section>

      <Section tone="sand">
        <SectionHeading title={t("faqTitle")} />
        <ul className={`${styles.faq} ${styles.faqWide}`}>
          {HP_FAQ.map((id) => (
            <li key={id} className={styles.faqItem}>
              <p className={styles.faqQ}>{t(`faq.${id}.q`)}</p>
              <p className={styles.faqA}>{t(`faq.${id}.a`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta />
    </>
  );
}
