import type { Metadata } from "next";
import clsx from "clsx";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import styles from "../line.module.scss";

const EV_STATS = ["s1", "s2", "s3", "s4"] as const;
const EV_SOLUTIONS = ["home", "business", "shared"] as const;
const EV_STEPS = ["s1", "s2", "s3", "s4"] as const;
const EV_KV = ["power", "conn", "time", "best"] as const;
const EV_FAQ = ["f1", "f2", "f3", "f4"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Lines.evcharge" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/hizmetler/ev-sarj", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lines.evcharge");
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
        <Button href={{ pathname: "/contact", query: { konu: "ev-sarj" } }} size="lg" withArrow>
          {tc("getQuote")}
        </Button>
        <div className={styles.heroStats}>
          {EV_STATS.map((id) => (
            <div key={id} className={styles.heroStat}>
              <span className={styles.n}>{t(`stats.${id}.v`)}</span>
              <span className={styles.l}>{t(`stats.${id}.l`)}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading title={t("solTitle")} intro={t("solIntro")} />
        <ul className={styles.grid3}>
          {EV_SOLUTIONS.map((id) => (
            <li key={id} className={styles.card}>
              <span className={styles.cardTag}>{t(`sol.${id}.tag`)}</span>
              <h3 className={styles.cardTitle}>{t(`sol.${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`sol.${id}.desc`)}</p>
              <ul className={styles.cardList}>
                {(["b1", "b2", "b3"] as const).map((b) => (
                  <li key={b}>{t(`sol.${id}.${b}`)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand">
        <SectionHeading title={t("stepsTitle")} intro={t("stepsIntro")} />
        <ul className={styles.steps}>
          {EV_STEPS.map((id, i) => (
            <li key={id} className={styles.card}>
              <p className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</p>
              <h3 className={styles.cardTitle}>{t(`steps.${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`steps.${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="light">
        <SectionHeading title={t("techTitle")} intro={t("techIntro")} />
        <div className={styles.grid2}>
          <div className={styles.panel}>
            <h3 className={styles.cardTitle}>{t("ac.title")}</h3>
            <p className={styles.panelLead}>{t("ac.lead")}</p>
            {EV_KV.map((id) => (
              <div key={id} className={styles.kv}>
                <span>{t(`kvLabels.${id}`)}</span>
                <span>{t(`ac.${id}`)}</span>
              </div>
            ))}
          </div>
          <div className={clsx(styles.panel, styles.volt)}>
            <h3 className={styles.cardTitle}>{t("dc.title")}</h3>
            <p className={styles.panelLead}>{t("dc.lead")}</p>
            {EV_KV.map((id) => (
              <div key={id} className={styles.kv}>
                <span>{t(`kvLabels.${id}`)}</span>
                <span>{t(`dc.${id}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <div className={styles.productRow}>
          <SectionHeading title={t("productsTitle")} />
        </div>
        <ul className={styles.faq}>
          {EV_FAQ.map((id) => (
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
