import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";
import styles from "../legal.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/privacy", locale),
  };
}

const PURPOSES = ["i1", "i2", "i3", "i4"] as const;
const RECIPIENTS = ["i1", "i2", "i3"] as const;
const RIGHTS = ["i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8"] as const;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <Section tone="light">
      <div className={styles.page}>
        <SectionHeading title={t("title")} intro={t("intro")} as="h1" />
        <p className={styles.updated}>{t("updated")}</p>

        <div className={styles.prose}>
          <h2>{t("s1.title")}</h2>
          <p>{t("s1.p1")}</p>
        </div>

        {/* Straight off SITE, so the notice cannot end up naming an address or a
            number the rest of the site has already moved on from. */}
        <dl className={styles.contact}>
          <div>
            <dt>{t("s1.addressLabel")}</dt>
            <dd>{SITE.address}</dd>
          </div>
          <div>
            <dt>{t("s1.emailLabel")}</dt>
            <dd>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </dd>
          </div>
          <div>
            <dt>{t("s1.phoneLabel")}</dt>
            <dd>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
            </dd>
          </div>
        </dl>

        <div className={styles.prose}>
          <h2>{t("s2.title")}</h2>
          <p>{t("s2.p1")}</p>
          <ul className={styles.groups}>
            <li>{t("s2.i1")}</li>
            <li>{t("s2.i2")}</li>
          </ul>
          <p>{t("s2.p2")}</p>
          <p>{t("s2.p3")}</p>

          <h2>{t("s3.title")}</h2>
          <ul className={styles.groups}>
            {PURPOSES.map((i) => (
              <li key={i}>{t(`s3.${i}`)}</li>
            ))}
          </ul>

          <h2>{t("s4.title")}</h2>
          <p>{t("s4.p1")}</p>

          <h2>{t("s5.title")}</h2>
          <p>{t("s5.p1")}</p>
          <ul className={styles.groups}>
            {RECIPIENTS.map((i) => (
              <li key={i}>{t(`s5.${i}`)}</li>
            ))}
          </ul>
          <p>{t("s5.p2")}</p>

          <h2>{t("s6.title")}</h2>
          <p>{t("s6.p1")}</p>

          <h2>{t("s7.title")}</h2>
          <p>{t("s7.p1")}</p>
          <ul className={styles.groups}>
            {RIGHTS.map((i) => (
              <li key={i}>{t(`s7.${i}`)}</li>
            ))}
          </ul>

          <h2>{t("s8.title")}</h2>
          <p>{t("s8.p1")}</p>

          <h2>{t("s9.title")}</h2>
          <p>
            {t("s9.p1")}{" "}
            <Link href="/cookies" className={styles.inlineLink}>
              {t("s9.link")}
            </Link>
          </p>
        </div>

        <Button href="/contact" withArrow className={styles.cta}>
          {t("s8.cta")}
        </Button>
      </div>
    </Section>
  );
}
