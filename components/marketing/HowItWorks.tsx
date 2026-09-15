import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./HowItWorks.module.scss";
import { ProcessScene } from "./ProcessScene";

const STEPS = [
  { id: "discovery" },
  { id: "engineering" },
  { id: "licensing" },
  { id: "procurement" },
  { id: "install" },
  { id: "om" },
] as const;

export async function HowItWorks({
  headingAs = "h2",
  compact = false,
}: {
  headingAs?: "h1" | "h2";
  compact?: boolean;
}) {
  const t = await getTranslations("Home.how");

  return (
    <Section tone="light" id="nasil-calisir" className={styles.deco}>
      <div className={clsx(styles.journey, compact && styles.compact)}>
        <div className={styles.head}>
          <SectionHeading
            as={headingAs}
            title={t("title")}
            intro={t("intro")}
          />
        </div>

        <div className={styles.pin} data-process-pin="">
          <div className={styles.sticky}>
            <ProcessScene
              pauseLabel={t("pauseMotion")}
              playLabel={t("playMotion")}
              sceneLabel={t("title")}
              stepTitles={STEPS.map(({ id }) => t(`${id}.shortTitle`))}
            >
              <ol className={styles.steps}>
                {STEPS.map(({ id }, index) => (
                  <li key={id} className={styles.step}>
                    <span className={styles.stepIndex} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.stepCopy}>
                      <h3 className={styles.stepTitle}>{t(`${id}.shortTitle`)}</h3>
                      <p className={styles.stepDesc}>{t(`${id}.desc`)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </ProcessScene>
          </div>
        </div>
      </div>
    </Section>
  );
}
