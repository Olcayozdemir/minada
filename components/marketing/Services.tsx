import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import type { StaticPathname } from "@/i18n/routing";
import styles from "./Services.module.scss";

// The four business-line doors. Renders as the homepage gateway (dark band)
// and as the /services hub. Every door carries one of the
// isometric diorama renders (alpha PNG, client assets, images/v2/service-*).
const DOORS: ReadonlyArray<{
  id: string;
  href: StaticPathname;
  img: string;
  w: number;
  h: number;
}> = [
  { id: "ges", href: "/hizmetler/gunes-enerjisi", img: "/images/v2/service-solar.png", w: 1920, h: 1434 },
  { id: "bess", href: "/hizmetler/enerji-depolama", img: "/images/v2/service-battery.png", w: 1920, h: 1434 },
  { id: "heatpump", href: "/hizmetler/isi-pompasi", img: "/images/v2/service-heatpump.png", w: 1920, h: 1434 },
  { id: "evcharge", href: "/hizmetler/ev-sarj", img: "/images/v2/service-ev.png", w: 1920, h: 1434 },
];

export async function Services({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const t = await getTranslations("Home.gateway");

  return (
    <Section tone="dark" id="cozumler" className={styles.band}>
      <div className={styles.head}>
        <SectionHeading
          as={headingAs}
          tone="dark"
          eyebrow={t("eyebrow")}
          title={t("title")}
          intro={t("intro")}
        />
      </div>
      <ul className={styles.grid}>
        {DOORS.map(({ id, href, img, w, h }) => (
          <li key={id}>
            <Link href={href} className={styles.card}>
              <span className={styles.stage} aria-hidden="true">
                <Image
                  src={img}
                  alt=""
                  width={w}
                  height={h}
                  sizes="(max-width: 700px) 72vw, (max-width: 1100px) 30vw, 19vw"
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
