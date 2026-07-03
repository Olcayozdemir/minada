import { getImageProps } from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";
import styles from "./FinalCta.module.scss";

export async function FinalCta() {
  const t = await getTranslations("Home.finalCta");
  const tc = await getTranslations("Common");

  // Art direction: portrait night-field render on phones, widescreen above.
  const common = { alt: "", sizes: "100vw", fill: true } as const;
  const { props: photo } = getImageProps({ ...common, src: "/images/v2/cta-2.jpg" });
  const {
    props: { srcSet: photoMobile },
  } = getImageProps({ ...common, src: "/images/v2/cta-mobile.jpeg" });

  return (
    <section className={styles.cta}>
      <picture>
        <source media="(max-width: 760px)" srcSet={photoMobile} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...photo} className={styles.photo} />
      </picture>
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
