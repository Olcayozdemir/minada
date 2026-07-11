import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import { GES_TYPES } from "@/lib/site";
import styles from "../line.module.scss";

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
        <Button href={{ pathname: "/contact", query: { konu: "ges" } }} size="lg" withArrow>
          {tc("getQuote")}
        </Button>
      </Section>

      <Section tone="light">
        <SectionHeading title={t("typesTitle")} />
        <ul className={styles.grid4}>
          {GES_TYPES.map((id) => (
            <li key={id} className={styles.card}>
              <h3 className={styles.cardTitle}>{t(`types.${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`types.${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand">
        <ul className={styles.grid2}>
          {(["aud1", "aud2"] as const).map((id) => (
            <li key={id} className={styles.card}>
              <h3 className={styles.cardTitle}>{t(`${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="light">
        <div className={styles.productRow}>
          <SectionHeading title={t("productsTitle")} />
          <Button
            href={{ pathname: "/urunler/[category]", params: { category: "gunes-panelleri" } }}
            variant="secondary"
            withArrow
          >
            {t("productsCta")}
          </Button>
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
