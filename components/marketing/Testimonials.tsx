import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconStar, IconHome, IconBuilding } from "@/components/ui/icons";
import styles from "./Testimonials.module.scss";

const ITEMS = ["t1", "t2", "t3"] as const;

// Segment → chip icon + label key. Tags each reference as a home or business
// customer per the segmented IA (plan §4.8).
const SEGMENTS = {
  home: { Icon: IconHome, labelKey: "segHome" },
  business: { Icon: IconBuilding, labelKey: "segBusiness" },
} as const;
type Segment = keyof typeof SEGMENTS;

export async function Testimonials() {
  const t = await getTranslations("Home.testimonials");

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <div className={styles.grid}>
        {ITEMS.map((id) => {
          const seg = t(`${id}.segment`) as Segment;
          const { Icon, labelKey } = SEGMENTS[seg] ?? SEGMENTS.home;
          return (
            <figure key={id} className={styles.card}>
              <div className={styles.topRow}>
                <div className={styles.stars} aria-label="5/5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} size={16} />
                  ))}
                </div>
                <span className={`${styles.chip} ${seg === "business" ? styles.chipBiz : ""}`}>
                  <Icon size={13} className={styles.chipIcon} />
                  {t(labelKey)}
                </span>
              </div>
              <blockquote className={styles.quote}>{t(`${id}.quote`)}</blockquote>
              <figcaption className={styles.person}>
                <span className={styles.name}>{t(`${id}.name`)}</span>
                <span className={styles.meta}>{t(`${id}.meta`)}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Section>
  );
}
