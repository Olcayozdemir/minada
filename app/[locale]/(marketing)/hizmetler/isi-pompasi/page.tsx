import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import styles from "../line.module.scss";

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
        <Button
          href={{ pathname: "/contact", query: { konu: "isi-pompasi" } }}
          size="lg"
          withArrow
        >
          {tc("getQuote")}
        </Button>
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

      {/* Havuz ısı pompası — villa/otel segmenti (Okan, 7.07 raporu). */}
      <Section tone="light">
        <div className={styles.pool}>
          <div>
            <h2 className={styles.poolTitle}>{t("pool.title")}</h2>
            <p className={styles.poolDesc}>{t("pool.desc")}</p>
          </div>
          <Button href={{ pathname: "/contact", query: { konu: "isi-pompasi" } }} withArrow>
            {tc("getQuote")}
          </Button>
        </div>
      </Section>

      <Section tone="light">
        <div className={styles.productRow}>
          <SectionHeading title={t("productsTitle")} />
          <Button
            href={{ pathname: "/urunler/[category]", params: { category: "isi-pompasi" } }}
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
