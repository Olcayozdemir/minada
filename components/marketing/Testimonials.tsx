import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconStar } from "@/components/ui/icons";
import styles from "./Testimonials.module.scss";

const ITEMS = ["t1", "t2", "t3"] as const;

export async function Testimonials() {
  const t = await getTranslations("Home.testimonials");

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <div className={styles.grid}>
        {ITEMS.map((id) => (
          <figure key={id} className={styles.card}>
            <div className={styles.stars} aria-label="5/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} size={16} />
              ))}
            </div>
            <blockquote className={styles.quote}>{t(`${id}.quote`)}</blockquote>
            <figcaption className={styles.person}>
              <span className={styles.name}>{t(`${id}.name`)}</span>
              <span className={styles.meta}>{t(`${id}.meta`)}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
