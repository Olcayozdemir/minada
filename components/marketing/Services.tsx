import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import type { StaticPathname } from "@/i18n/routing";
import styles from "./Services.module.scss";

// The five doors: four business lines + camping. Renders as the homepage
// gateway (dark band) and as the /services hub. Tiles reuse the catalog's
// 3D renders so the gold-glow imagery language carries through.
const DOORS: ReadonlyArray<{ id: string; href: StaticPathname; img: string }> = [
  { id: "ges", href: "/hizmetler/gunes-enerjisi", img: "/images/products/panels.png" },
  { id: "bess", href: "/hizmetler/enerji-depolama", img: "/images/products/storage.png" },
  { id: "heatpump", href: "/hizmetler/isi-pompasi", img: "/images/products/heat-pumps.png" },
  { id: "evcharge", href: "/hizmetler/ev-sarj", img: "/images/products/ev-charging.png" },
  { id: "camp", href: "/cozumler/kamp-outdoor", img: "/images/products/portable-power.png" },
];

export async function Services({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const t = await getTranslations("Home.gateway");

  return (
    <Section tone="dark" id="cozumler">
      <SectionHeading
        as={headingAs}
        tone="dark"
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />
      <ul className={styles.grid}>
        {DOORS.map(({ id, href, img }) => (
          <li key={id}>
            <Link href={href} className={styles.card}>
              <span className={styles.stage} aria-hidden="true">
                <Image
                  src={img}
                  alt=""
                  width={420}
                  height={240}
                  sizes="(max-width: 700px) 72vw, 300px"
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
