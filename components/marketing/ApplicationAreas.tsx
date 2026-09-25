import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconHome, IconBuilding, IconLeaf, IconLandmark } from "@/components/ui/icons";
import styles from "./ApplicationAreas.module.scss";

// GEÇİCİ (2026-09-25): Konut kartı için dört mesken adayı yan yana
// karşılaştırılsın diye her kart bir adayı gösteriyor. Seçim yapılınca bu
// commit geri alınır ve yalnızca Konut seçilen adaya bağlanır; kalıcı
// görseller: konut → area-konut.jpg, ticari → area-ticari-saha.jpg,
// tarim → area-tarim-sulama.jpg, kamu → area-kamu.jpg.
const AREAS = [
  { id: "konut", Icon: IconHome, img: "/images/v2/area-konut-aday-1.jpg" },
  { id: "ticari", Icon: IconBuilding, img: "/images/v2/area-konut-aday-2.jpg" },
  { id: "tarim", Icon: IconLeaf, img: "/images/v2/area-konut-aday-3.jpg" },
  { id: "kamu", Icon: IconLandmark, img: "/images/v2/area-konut-aday-4.jpg" },
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
