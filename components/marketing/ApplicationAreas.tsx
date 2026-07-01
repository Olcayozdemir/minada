import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconHome, IconBuilding, IconLeaf, IconLandmark } from "@/components/ui/icons";
import styles from "./ApplicationAreas.module.scss";

const AREAS = [
  { id: "konut", Icon: IconHome },
  { id: "ticari", Icon: IconBuilding },
  { id: "tarim", Icon: IconLeaf },
  { id: "kamu", Icon: IconLandmark },
] as const;

export async function ApplicationAreas() {
  const t = await getTranslations("Home.areas");

  return (
    <Section tone="sand" id="uygulama-alanlari">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className={styles.grid}>
        {AREAS.map(({ id, Icon }) => (
          <div key={id} className={styles.card}>
            <span className={styles.icon}>
              <Icon size={24} />
            </span>
            <h3 className={styles.title}>{t(`${id}.title`)}</h3>
            <p className={styles.desc}>{t(`${id}.desc`)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
