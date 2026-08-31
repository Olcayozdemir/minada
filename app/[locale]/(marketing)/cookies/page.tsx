import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { buildAlternates } from "@/lib/seo";
import styles from "../legal.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cookies" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/cookies", locale),
  };
}

/* The two records the site actually keeps. Rendered as labelled blocks rather
   than a four-column table: at two rows a table buys nothing and would need a
   scroller on a phone. Add a row here and in the messages together. */
const RECORDS = ["r1", "r2"] as const;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cookies");

  return (
    <Section tone="light">
      <div className={styles.page}>
        <SectionHeading title={t("title")} intro={t("intro")} as="h1" />
        <p className={styles.updated}>{t("updated")}</p>

        <div className={styles.prose}>
          <h2>{t("s1.title")}</h2>
          <p>{t("s1.p1")}</p>
          <p>{t("s1.p2")}</p>

          <h2>{t("s2.title")}</h2>
          <ul className={styles.groups}>
            <li>{t("s2.necessary")}</li>
            <li>{t("s2.analytics")}</li>
            <li>{t("s2.marketing")}</li>
          </ul>

          <h2>{t("s3.title")}</h2>
          <p>{t("s3.intro")}</p>
        </div>

        <ul className={styles.records}>
          {RECORDS.map((r) => (
            <li key={r} className={styles.record}>
              <p className={styles.recordName}>{t(`s3.${r}n`)}</p>
              <dl className={styles.recordMeta}>
                <div>
                  <dt>{t("s3.col2")}</dt>
                  <dd>{t(`s3.${r}g`)}</dd>
                </div>
                <div>
                  <dt>{t("s3.col4")}</dt>
                  <dd>{t(`s3.${r}d`)}</dd>
                </div>
              </dl>
              <p className={styles.recordWhat}>{t(`s3.${r}w`)}</p>
            </li>
          ))}
        </ul>

        <div className={styles.prose}>
          <h2>{t("s4.title")}</h2>
          <p>{t("s4.p1")}</p>
          <p>{t("s4.p2")}</p>

          <h2>{t("s5.title")}</h2>
          <p>{t("s5.p1")}</p>
        </div>

        <Button href="/contact" withArrow className={styles.cta}>
          {t("s5.cta")}
        </Button>
      </div>
    </Section>
  );
}
