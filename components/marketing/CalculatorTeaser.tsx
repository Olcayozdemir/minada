import { CalculatorDemo } from "./CalculatorDemo";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/icons";
import styles from "./CalculatorTeaser.module.scss";

export async function CalculatorTeaser() {
  const t = await getTranslations("Home.calc");
  const points = [1, 2, 3, 4, 5, 6].map((n) => t(`point${n}`));

  return (
    <Section tone="light">
      <div className={styles.grid}>
        {/* Three blocks so the copy can span the demo card top to bottom. */}
        <div className={styles.copy}>
          <div>
            <h2 className={styles.title}>{t("title")}</h2>
            <p className={styles.desc}>{t("desc")}</p>
          </div>
          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p}>
                <IconCheck size={16} /> {p}
              </li>
            ))}
          </ul>
          <div>
            <div className={styles.actions}>
              <Button href="/calculator" size="lg" withArrow>
                {t("cta")}
              </Button>
            </div>
            <p className={styles.note}>{t("note")}</p>
          </div>
        </div>

        <div className={styles.media}>
          <CalculatorDemo />
        </div>
      </div>
    </Section>
  );
}
