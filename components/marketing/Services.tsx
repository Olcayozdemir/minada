import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  IconSolar,
  IconGroundMount,
  IconLeaf,
  IconCarport,
  IconBattery,
  IconBlueprint,
  IconLandmark,
  IconPackage,
  IconInstall,
  IconActivity,
} from "@/components/ui/icons";
import styles from "./Services.module.scss";

const CARDS = [
  { id: "rooftop", Icon: IconSolar },
  { id: "ground", Icon: IconGroundMount },
  { id: "agripv", Icon: IconLeaf },
  { id: "carport", Icon: IconCarport },
  { id: "bess", Icon: IconBattery },
  { id: "engineering", Icon: IconBlueprint },
  { id: "licensing", Icon: IconLandmark },
  { id: "procurement", Icon: IconPackage },
  { id: "construction", Icon: IconInstall },
  { id: "om", Icon: IconActivity },
] as const;

export async function Services() {
  const t = await getTranslations("Home.services");
  const ts = await getTranslations("Services");

  return (
    <Section tone="dark" id="hizmetler">
      <SectionHeading tone="dark" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <ul className={styles.grid}>
        {CARDS.map(({ id, Icon }) => (
          <li key={id} className={styles.card}>
            <span className={styles.iconChip}>
              <Icon size={22} />
            </span>
            <div className={styles.body}>
              <h3 className={styles.cardTitle}>{ts(id)}</h3>
              <p className={styles.cardDesc}>{t(`${id}.desc`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
