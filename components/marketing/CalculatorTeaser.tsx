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
    <Section tone="light" className={styles.deco}>
      <div className={styles.particles} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
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
          <Image
            src="/images/v2/calc-2.jpg"
            alt=""
            width={720}
            height={560}
            sizes="(max-width: 900px) 92vw, 46vw"
            className={styles.img}
          />
          <div className={styles.badge}>
            <svg className={styles.gauge} width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
              <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(238,242,247,0.18)" strokeWidth="4" />
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke="var(--gold-300)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset="13"
                transform="rotate(-90 26 26)"
              />
            </svg>
            <div>
              <strong>{t("badgeValue")}</strong>
              <span>{t("badgeLabel")}</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
