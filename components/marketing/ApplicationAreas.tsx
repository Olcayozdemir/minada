import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./ApplicationAreas.module.scss";

const AREAS = ["konut", "ticari", "tarim", "kamu"] as const;

export async function ApplicationAreas() {
  const t = await getTranslations("Home.areas");

  return (
    <Section tone="light" id="uygulama-alanlari" className={styles.section}>
      <h2 className="sr-only">{t("title")}</h2>
      <ul className={styles.list}>
        {AREAS.map((id) => (
          <li key={id} className={styles.item}>
            <Link href={{ pathname: "/solutions", hash: id }} className={styles.link}>
              <h3 className={styles.title}>{t(`${id}.title`)}</h3>
              <p className={styles.desc}>{t(`${id}.desc`)}</p>
              <span className={styles.arrow} aria-hidden="true">
                <IconArrowRight size={17} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
