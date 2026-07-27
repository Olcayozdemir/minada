import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  IconSearch,
  IconBlueprint,
  IconLandmark,
  IconPackage,
  IconInstall,
  IconActivity,
} from "@/components/ui/icons";
import styles from "./HowItWorks.module.scss";

// Six delivery steps, survey → O&M. `art` reuses the illustrated icons from
// the retired process service cards (public/images/services/<art>.png).
const STEPS = [
  { id: "discovery", Icon: IconSearch, art: null },
  { id: "engineering", Icon: IconBlueprint, art: "engineering" },
  { id: "licensing", Icon: IconLandmark, art: "licensing" },
  { id: "procurement", Icon: IconPackage, art: "procurement" },
  { id: "install", Icon: IconInstall, art: "construction" },
  { id: "om", Icon: IconActivity, art: "om" },
] as const;

// A step's photo is optional: if the file has been dropped in, show it;
// otherwise fall back to the branded illustration placeholder. Checked at
// build time (this is a server component), so no runtime cost or 404s.
function stepImage(id: string): string | null {
  const rel = `images/v2/how/${id}.jpg`;
  return existsSync(join(process.cwd(), "public", rel)) ? `/${rel}` : null;
}

// Illustrated icon carried over from the old service cards, if present.
function stepArt(art: string | null): string | null {
  if (!art) return null;
  const rel = `images/services/${art}.png`;
  return existsSync(join(process.cwd(), "public", rel)) ? `/${rel}` : null;
}

export async function HowItWorks({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const t = await getTranslations("Home.how");

  return (
    <Section tone="light" id="nasil-calisir" className={styles.deco}>
      <div className={styles.head}>
        <SectionHeading
          as={headingAs}
          eyebrow={t("eyebrow")}
          title={t("title")}
          intro={t("intro")}
        />
      </div>
      <ol className={styles.grid}>
        {STEPS.map(({ id, Icon, art }, i) => {
          const img = stepImage(id);
          const artImg = stepArt(art);
          return (
            <li key={id} className={styles.step}>
              <div className={styles.media}>
                {img ? (
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(max-width: 560px) 88vw, (max-width: 900px) 44vw, 30vw"
                    className={styles.mediaImg}
                  />
                ) : (
                  <div className={styles.placeholder} aria-hidden="true">
                    {artImg ? (
                      <Image src={artImg} alt="" width={84} height={84} className={styles.art} />
                    ) : (
                      <Icon size={30} />
                    )}
                  </div>
                )}
                <span className={styles.scrim} aria-hidden="true" />
              </div>
              {/* Editorial index line — the <ol> already carries order semantically. */}
              <div className={styles.meta} aria-hidden="true">
                <span className={styles.num}>{`0${i + 1}`}</span>
                <span className={styles.rule} />
              </div>
              <div className={styles.body}>
                <h3 className={styles.stepTitle}>{t(`${id}.title`)}</h3>
                <p className={styles.stepDesc}>{t(`${id}.desc`)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
