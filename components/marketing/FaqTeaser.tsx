import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./FaqTeaser.module.scss";

const ITEMS = ["cost", "payback", "warranty", "incentives"] as const;

export async function FaqTeaser() {
  const t = await getTranslations("Home.faq");

  return (
    <Section tone="sand" id="sss" className={styles.compact}>
      <div className={styles.cols}>
        <div className={styles.head}>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
          <Link href="/faq" className={styles.more}>
            {t("cta")} <IconArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.list}>
          {ITEMS.map((id) => (
            <details key={id} className={styles.item}>
              <summary className={styles.summary}>{t(`${id}.q`)}</summary>
              <div className={styles.answer}>{t(`${id}.a`)}</div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
