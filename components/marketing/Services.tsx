import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import type { StaticPathname } from "@/i18n/routing";
import styles from "./Services.module.scss";

// The five doors: four business lines + camping. Renders as the homepage
// gateway (dark band) and as the /services hub. Cards carry the flat gold
// illustration icons the client picked (public/images/services/ — rooftop &
// bess are the original set; heatpump/evcharge/camp drawn to match). Plain
// <img>: decorative fixed-size assets, SVGs skip the optimizer.
const DOORS: ReadonlyArray<{ id: string; href: StaticPathname; img: string }> = [
  { id: "ges", href: "/hizmetler/gunes-enerjisi", img: "/images/services/rooftop.png" },
  { id: "bess", href: "/hizmetler/enerji-depolama", img: "/images/services/bess.png" },
  { id: "heatpump", href: "/hizmetler/isi-pompasi", img: "/images/services/heatpump.svg" },
  { id: "evcharge", href: "/hizmetler/ev-sarj", img: "/images/services/evcharge.svg" },
  { id: "camp", href: "/cozumler/kamp-outdoor", img: "/images/services/camp.svg" },
];

export async function Services({
  headingAs = "h2",
  exclude,
}: {
  headingAs?: "h1" | "h2";
  /** Door ids to hide in this context (e.g. "camp" on the business page). */
  exclude?: ReadonlyArray<string>;
}) {
  const t = await getTranslations("Home.gateway");
  const doors = exclude ? DOORS.filter((d) => !exclude.includes(d.id)) : DOORS;

  return (
    <Section tone="dark" id="cozumler">
      <SectionHeading
        as={headingAs}
        tone="dark"
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />
      <ul className={doors.length === 4 ? `${styles.grid} ${styles.gridFour}` : styles.grid}>
        {doors.map(({ id, href, img }) => (
          <li key={id}>
            <Link href={href} className={styles.card}>
              <span className={styles.stage} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  width={256}
                  height={256}
                  loading="lazy"
                  className={styles.stageImg}
                />
              </span>
              <span className={styles.body}>
                <span className={styles.chips}>{t(`${id}.chips`)}</span>
                <span className={styles.cardTitle}>{t(`${id}.title`)}</span>
                <span className={styles.cardDesc}>{t(`${id}.desc`)}</span>
                <span className={styles.foot} aria-hidden="true">
                  <span className={styles.rule} />
                  <span className={styles.go}>
                    <IconArrowRight size={16} />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
