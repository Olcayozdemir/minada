import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LeadForm } from "@/components/marketing/LeadForm";
import { SITE, whatsappLink } from "@/lib/site";
import styles from "./page.module.scss";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Contact");

  const defaultCity = typeof sp.city === "string" ? sp.city : "";
  const defaultBill = typeof sp.bill === "string" ? sp.bill : "";

  return (
    <Section tone="dark">
      <SectionHeading tone="dark" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className={styles.layout}>
        <div className={styles.formCol}>
          <LeadForm defaultCity={defaultCity} defaultBill={defaultBill} />
        </div>
        <aside className={styles.info}>
          <h2 className={styles.infoTitle}>{t("info.title")}</h2>
          <ul className={styles.infoList}>
            <li>
              <span className={styles.infoLabel}>{t("info.phoneLabel")}</span>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
            </li>
            <li>
              <span className={styles.infoLabel}>{t("info.emailLabel")}</span>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <span className={styles.infoLabel}>{t("info.whatsappLabel")}</span>
              <a href={whatsappLink(t("whatsappMessage"))} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <span className={styles.infoLabel}>{t("info.hoursLabel")}</span>
              <span>{t("info.hours")}</span>
            </li>
          </ul>
          <p className={styles.infoNote}>{t("info.note")}</p>
        </aside>
      </div>
    </Section>
  );
}
