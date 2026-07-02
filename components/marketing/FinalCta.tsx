import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";
import styles from "./FinalCta.module.scss";

export async function FinalCta() {
  const t = await getTranslations("Home.finalCta");
  const tc = await getTranslations("Common");

  return (
    <section className={styles.cta}>
      <Image src="/images/v2/cta.jpg" alt="" fill sizes="100vw" className={styles.photo} />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.card}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 className={styles.title}>{t("title")}</h2>
        <p className={styles.desc}>{t("desc")}</p>
        <div className={styles.actions}>
          <Button href="/contact" size="lg" withArrow>
            {tc("getQuote")}
          </Button>
          <Button externalHref={whatsappLink(t("waMessage"))} variant="glass" size="lg">
            {tc("whatsapp")}
          </Button>
        </div>
      </div>
    </section>
  );
}
