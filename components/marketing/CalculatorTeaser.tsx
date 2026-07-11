import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/icons";
import styles from "./CalculatorTeaser.module.scss";

export async function CalculatorTeaser() {
  const t = await getTranslations("Home.calc");
  const points = [t("point1"), t("point2"), t("point3")];

  return (
    <Section tone="light">
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.desc}>{t("desc")}</p>
          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p}>
                <IconCheck size={16} /> {p}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Button href="/calculator" size="lg" withArrow>
              {t("cta")}
            </Button>
          </div>
          <p className={styles.note}>{t("note")}</p>
        </div>

        <div className={styles.media}>
          {/* Akıllı ev + izleme panoları render'ı (şeffaf PNG, teal enerji
              hattı) — çerçevesiz float eder. */}
          <Image
            src="/images/v2/calc-home.png"
            alt=""
            width={880}
            height={491}
            sizes="(max-width: 900px) 94vw, 48vw"
            className={styles.img}
          />
        </div>
      </div>
    </Section>
  );
}
