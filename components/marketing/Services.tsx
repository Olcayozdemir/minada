import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import {
  IconSolar,
  IconBattery,
  IconEvCharge,
  IconHeatPump,
  IconArrowRight,
} from "@/components/ui/icons";
import styles from "./Services.module.scss";

const CARDS = [
  { id: "solar", Icon: IconSolar },
  { id: "storage", Icon: IconBattery },
  { id: "ev", Icon: IconEvCharge },
  { id: "heatpump", Icon: IconHeatPump },
] as const;

export async function Services() {
  const t = await getTranslations("Home.services");
  const ts = await getTranslations("Services");

  return (
    <Section tone="light" id="hizmetler">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className={styles.grid}>
        {CARDS.map(({ id, Icon }) => (
          <Link key={id} href="/services" className={styles.card}>
            <span className={styles.icon}>
              <Icon size={26} />
            </span>
            <h3 className={styles.cardTitle}>{ts(id)}</h3>
            <p className={styles.cardDesc}>{t(`${id}.desc`)}</p>
            <span className={styles.more}>
              {t("cta")} <IconArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
