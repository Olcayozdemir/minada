import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconSearch, IconBlueprint, IconInstall, IconSupport } from "@/components/ui/icons";
import { HowScrollFx } from "./HowScrollFx";
import styles from "./HowItWorks.module.scss";

const STEPS = [
  { id: "discovery", Icon: IconSearch },
  { id: "design", Icon: IconBlueprint },
  { id: "install", Icon: IconInstall },
  { id: "support", Icon: IconSupport },
] as const;

// A step's photo is optional: if the file has been dropped in, show it;
// otherwise fall back to the branded illustration placeholder. Checked at
// build time (this is a server component), so no runtime cost or 404s.
function stepImage(id: string): string | null {
  const rel = `images/v2/how/${id}.jpg`;
  return existsSync(join(process.cwd(), "public", rel)) ? `/${rel}` : null;
}

export async function HowItWorks() {
  const t = await getTranslations("Home.how");

  return (
    <Section tone="light" id="nasil-calisir" className={styles.deco}>
      <HowScrollFx
        heading={
          <div className={styles.head}>
            <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
          </div>
        }
      >
        {STEPS.map(({ id, Icon }, i) => {
          const img = stepImage(id);
          return (
            <li key={id} className={styles.step}>
              <div className={styles.media}>
                {img ? (
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(max-width: 760px) 82vw, 24vw"
                    className={styles.mediaImg}
                  />
                ) : (
                  <div className={styles.placeholder} aria-hidden="true">
                    <span className={styles.ghost}>{`0${i + 1}`}</span>
                    <Icon size={30} />
                  </div>
                )}
                <span className={styles.num}>{`0${i + 1}`}</span>
              </div>
              <div className={styles.body}>
                <h3 className={styles.stepTitle}>{t(`${id}.title`)}</h3>
                <p className={styles.stepDesc}>{t(`${id}.desc`)}</p>
              </div>
            </li>
          );
        })}
      </HowScrollFx>
    </Section>
  );
}
