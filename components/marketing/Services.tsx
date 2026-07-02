import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import {
  IconSolar,
  IconBattery,
  IconEvCharge,
  IconHeatPump,
  IconArrowRight,
} from "@/components/ui/icons";
import styles from "./Services.module.scss";

const CARDS = [
  { id: "solar", Icon: IconSolar, img: "/images/v2/service-solar.jpg" },
  { id: "storage", Icon: IconBattery, img: "/images/v2/service-battery.jpg" },
  { id: "ev", Icon: IconEvCharge, img: "/images/v2/service-ev.jpg" },
  { id: "heatpump", Icon: IconHeatPump, img: "/images/v2/service-heatpump.jpg" },
] as const;

export async function Services() {
  const t = await getTranslations("Home.services");
  const ts = await getTranslations("Services");

  return (
    <Section tone="dark" id="hizmetler">
      <SectionHeading tone="dark" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className={styles.grid}>
        {CARDS.map(({ id, Icon, img }) => (
          <Link key={id} href="/services" className={styles.card}>
            <span className={styles.media}>
              <Image
                src={img}
                alt=""
                width={560}
                height={400}
                sizes="(max-width: 640px) 78vw, (max-width: 1080px) 46vw, 24vw"
              />
              <span className={styles.iconChip}>
                <Icon size={20} />
              </span>
            </span>
            <h3 className={styles.cardTitle}>{ts(id)}</h3>
            <p className={styles.cardDesc}>{t(`${id}.desc`)}</p>
            <span className={styles.more}>
              {t("cta")} <IconArrowRight size={15} />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
