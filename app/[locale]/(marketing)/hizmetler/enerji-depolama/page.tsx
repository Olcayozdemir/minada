import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FinalCta } from "@/components/marketing/FinalCta";
import { BessFlow } from "@/components/marketing/BessFlow";
import { buildAlternates } from "@/lib/seo";
import styles from "../line.module.scss";

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
        <Button href={{ pathname: "/contact", query: { konu: "depolama" } }} size="lg" withArrow>
          {tc("getQuote")}
        </Button>
        <BessFlow />
      </Section>

      <Section tone="light">
        <SectionHeading title={t("scalesTitle")} intro={t("scalesIntro")} />
        <ul className={styles.grid3}>
          {BESS_SCALES.map((id) => (
            <li key={id} className={styles.card}>
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
