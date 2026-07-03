import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
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

// A service's card icon: use the dropped-in illustration (public/images/services/
// <id>.png) if present, otherwise fall back to the inline SVG. Checked at build
// time — this is a server component, so no runtime cost or 404s.
function serviceIcon(id: string): string | null {
  const rel = `images/services/${id}.png`;
  return existsSync(join(process.cwd(), "public", rel)) ? `/${rel}` : null;
}

export async function Services() {
  const t = await getTranslations("Home.services");
  const ts = await getTranslations("Services");

  return (
    <Section tone="dark" id="hizmetler">
      <SectionHeading tone="dark" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <ul className={styles.grid}>
        {CARDS.map(({ id, Icon }) => {
          const img = serviceIcon(id);
          return (
            <li key={id} className={styles.card}>
              {img ? (
                <span className={styles.iconImg}>
                  <Image src={img} alt="" width={72} height={72} />
                </span>
              ) : (
                <span className={styles.iconChip}>
                  <Icon size={22} />
                </span>
              )}
              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{ts(id)}</h3>
                <p className={styles.cardDesc}>{t(`${id}.desc`)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
