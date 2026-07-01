import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { IconCalculator } from "@/components/ui/icons";
import styles from "./CalculatorTeaser.module.scss";

export async function CalculatorTeaser() {
  const t = await getTranslations("Home.calc");

  return (
    <Section tone="band">
      <div className={styles.copy}>
        <span className={styles.icon}>
          <IconCalculator size={28} />
        </span>
        <h2 className={styles.title}>{t("title")}</h2>
        <p className={styles.desc}>{t("desc")}</p>
        <div className={styles.actions}>
          <Button href="/calculator" size="lg">
            {t("cta")}
          </Button>
        </div>
        <p className={styles.note}>{t("note")}</p>
      </div>
    </Section>
  );
}
