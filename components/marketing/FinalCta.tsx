import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";
import styles from "./FinalCta.module.scss";

export async function FinalCta() {
  const t = await getTranslations("Home.finalCta");
  const tc = await getTranslations("Common");

  return (
    <Section tone="band">
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 className={styles.title}>{t("title")}</h2>
        <p className={styles.desc}>{t("desc")}</p>
        <div className={styles.actions}>
          <Button href="/contact" size="lg">
            {tc("getQuote")}
          </Button>
          <Button externalHref={whatsappLink(t("waMessage"))} variant="secondary" size="lg">
            {tc("whatsapp")}
          </Button>
        </div>
      </div>
    </Section>
  );
}
