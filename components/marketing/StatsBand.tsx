import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUp } from "./CountUp";
import styles from "./StatsBand.module.scss";

const STATS = ["years", "projects", "capacity", "solutions"] as const;

/**
 * "Rakamlarla MİNADA" — shared by the homepage and the About page. Copy lives
 * in the `About.stats*` messages (single source); numbers count up on entry.
 * Labels live in <dt>, values in <dd>; visual order is flipped in CSS.
 */
export async function StatsBand() {
  const t = await getTranslations("About");

  return (
    <Section tone="band">
      {/* The figures are the founding team's track record, not the company's:
          the note says so before anyone reads them as MİNADA's own. */}
      <SectionHeading tone="dark" title={t("statsTitle")} note={t("statsNote")} />
      <dl className={styles.stats}>
        {STATS.map((k) => (
          <div key={k} className={styles.stat}>
            <dt className={styles.statLabel}>{t(`stats.${k}.label`)}</dt>
            <dd className={styles.statValue}>
              <CountUp value={Number(t(`stats.${k}.value`))} />
              {t(`stats.${k}.suffix`) ? (
                <span className={styles.suffix}>{t(`stats.${k}.suffix`)}</span>
              ) : null}
            </dd>
            {t.has(`stats.${k}.sub`) ? (
              <dd className={styles.statSub}>{t(`stats.${k}.sub`)}</dd>
            ) : null}
          </div>
        ))}
      </dl>
    </Section>
  );
}
