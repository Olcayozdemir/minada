import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import type { StaticPathname } from "@/i18n/routing";
import styles from "./CrossSell.module.scss";

// "Güneşten fazlası" — GES'in yanına eklenebilecek iş kolları, altın
// illüstrasyon ikonlarıyla (Evim için sayfası; metinler Segments.home.cross).
const ITEMS: ReadonlyArray<{ id: string; href: StaticPathname; img: string }> = [
  { id: "heatpump", href: "/hizmetler/isi-pompasi", img: "/images/services/heatpump.svg" },
  { id: "evcharge", href: "/hizmetler/ev-sarj", img: "/images/services/evcharge.svg" },
  { id: "bess", href: "/hizmetler/enerji-depolama", img: "/images/services/bess.png" },
];

export async function CrossSell() {
  const t = await getTranslations("Segments.home.cross");

  return (
    <Section tone="light">
      <SectionHeading title={t("title")} intro={t("intro")} />
      <ul className={styles.grid}>
        {ITEMS.map(({ id, href, img }) => (
          <li key={id}>
            <Link href={href} className={styles.card}>
              <span className={styles.stage} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" width={256} height={256} loading="lazy" className={styles.icon} />
              </span>
              <span className={styles.body}>
                <span className={styles.title}>{t(`items.${id}.title`)}</span>
                <span className={styles.desc}>{t(`items.${id}.desc`)}</span>
                <span className={styles.footRow} aria-hidden="true">
                  <span className={styles.rule} />
                  <span className={styles.go}>
                    <IconArrowRight size={15} />
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
