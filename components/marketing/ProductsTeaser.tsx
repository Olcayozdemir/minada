import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconSolar, IconBolt, IconBattery, IconEvCharge, IconArrowRight } from "@/components/ui/icons";
import styles from "./ProductsTeaser.module.scss";

// Equipment classes MİNADA supplies. The v1 catalog leads with panels; the
// other tiles frame the full EPC scope. Every tile links to the showcase.
const CATEGORIES = [
  { id: "panels", Icon: IconSolar },
  { id: "inverters", Icon: IconBolt },
  { id: "storage", Icon: IconBattery },
  { id: "charging", Icon: IconEvCharge },
] as const;

export async function ProductsTeaser() {
  const t = await getTranslations("Home.products");

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <ul className={styles.grid}>
        {CATEGORIES.map(({ id, Icon }) => (
          <li key={id}>
            <Link href="/urunler" className={styles.card}>
              <span className={styles.icon}>
                <Icon size={26} />
              </span>
              <span className={styles.cardTitle}>{t(`cat.${id}`)}</span>
              <span className={styles.cardDesc}>{t(`cat.${id}Desc`)}</span>
              <span className={styles.go} aria-hidden="true">
                <IconArrowRight size={16} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <p className={styles.brands}>
          <span className={styles.brandsLabel}>{t("brandsLabel")}</span>
          <span className={styles.brandsList}>{t("brands")}</span>
        </p>
        <Button href="/urunler" size="lg" withArrow>
          {t("cta")}
        </Button>
      </div>
    </Section>
  );
}
