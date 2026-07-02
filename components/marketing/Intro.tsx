import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { IconCheck } from "@/components/ui/icons";
import styles from "./Intro.module.scss";

export async function Intro() {
  const t = await getTranslations("Home.intro");

  return (
    <Section tone="light">
      <div className={styles.grid}>
        <div className={styles.photos}>
          <Image
            src="/images/v2/area-konut.jpg"
            alt=""
            width={420}
            height={300}
            sizes="(max-width: 900px) 46vw, 320px"
            className={styles.ph1}
          />
          <Image
            src="/images/v2/service-solar.jpg"
            alt=""
            width={420}
            height={300}
            sizes="(max-width: 900px) 46vw, 320px"
            className={styles.ph2}
          />
          <div className={styles.chip}>
            <strong>{t("chipValue")}</strong>
            <span>{t("chipLabel")}</span>
          </div>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <p className={styles.lead}>
            {t("lead")} <em>{t("boldPart")}</em> {t("rest")}
            <span className={styles.muted}> {t("muted")}</span>
          </p>
          <ul className={styles.points}>
            <li>
              <IconCheck size={16} /> {t("point1")}
            </li>
            <li>
              <IconCheck size={16} /> {t("point2")}
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
