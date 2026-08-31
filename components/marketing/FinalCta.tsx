import { getImageProps } from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";
import styles from "./FinalCta.module.scss";

export async function FinalCta({
  namespace = "Home.finalCta",
}: {
  /* About reuses the same photo+glass finale with its own copy. */
  namespace?: "Home.finalCta" | "About.finalCta";
} = {}) {
  const t = await getTranslations(namespace);
  const tc = await getTranslations("Common");

  // Tek kaynak: gündüz sahnesi her genişlikte. Eski dikey gece render'ı
  // (cta-mobile.jpeg) masaüstü gündüze dönünce sahne olarak eşleşmez kaldı —
  // 760px altında bambaşka bir görsel açılıyordu. Eşleşen dikey gündüz render'ı
  // gelince <source media="(max-width: 760px)"> satırı geri gelir.
  const common = { alt: "", sizes: "100vw", fill: true } as const;
  const { props: photo } = getImageProps({ ...common, src: "/images/v2/cta-2.jpg" });

  return (
    <section className={styles.cta}>
      <picture>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...photo} className={styles.photo} />
      </picture>
      <div className={styles.card} data-reveal="">
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
