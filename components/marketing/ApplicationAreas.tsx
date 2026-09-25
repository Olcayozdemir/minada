import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconHome, IconBuilding, IconLeaf, IconLandmark } from "@/components/ui/icons";
import styles from "./ApplicationAreas.module.scss";

const AREAS = [
  { id: "konut", Icon: IconHome, img: "/images/v2/area-konut.jpg" },
  { id: "ticari", Icon: IconBuilding, img: "/images/v2/area-ticari-saha.jpg" },
  { id: "tarim", Icon: IconLeaf, img: "/images/v2/area-tarim-sulama.jpg" },
  { id: "kamu", Icon: IconLandmark, img: "/images/v2/area-kamu.jpg" },
] as const;

export async function ApplicationAreas() {
  const t = await getTranslations("Home.areas");

  return (
    <Section tone="sand" id="uygulama-alanlari">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className={styles.grid}>
        {AREAS.map(({ id, Icon, img }) => (
          <Link key={id} href={{ pathname: "/solutions", hash: id }} className={styles.tile}>
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 900px) 46vw, 23vw"
              className={styles.img}
            />
            <div className={styles.label}>
              <span className={styles.labelIcon}>
                <Icon size={18} />
              </span>
              <div>
                <h3 className={styles.title}>{t(`${id}.title`)}</h3>
                <p className={styles.desc}>{t(`${id}.desc`)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
