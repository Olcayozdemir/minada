import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconSearch, IconBlueprint, IconInstall, IconSupport } from "@/components/ui/icons";
import styles from "./HowItWorks.module.scss";

const STEPS = [
  { id: "discovery", Icon: IconSearch },
  { id: "design", Icon: IconBlueprint },
  { id: "install", Icon: IconInstall },
  { id: "support", Icon: IconSupport },
] as const;

export async function HowItWorks() {
  const t = await getTranslations("Home.how");

  return (
    <Section tone="light" id="nasil-calisir" className={styles.deco}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <ol className={styles.grid}>
        {STEPS.map(({ id, Icon }, i) => (
          <li key={id} className={styles.step}>
            <span className={styles.num}>{`0${i + 1}`}</span>
            <span className={styles.icon}>
              <Icon size={26} />
            </span>
            <h3 className={styles.stepTitle}>{t(`${id}.title`)}</h3>
            <p className={styles.stepDesc}>{t(`${id}.desc`)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
