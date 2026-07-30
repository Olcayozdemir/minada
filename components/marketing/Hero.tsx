import Image, { getImageProps } from "next/image";
import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { SinkOnScroll } from "./SinkOnScroll";
import styles from "./Hero.module.scss";

export async function Hero() {
  const t = await getTranslations("Hero");
  const tc = await getTranslations("Common");
  const tagline = t("tagline");
  const accent = t("taglineAccent");
  const [pre, post] = tagline.split(accent);

  // Desktop tells the before/after story: the base frame sits dark with a
  // bare roof; the energized twin (panels, battery, wallbox, heat pump, teal
  // energy path) crossfades in on hover (see .lit). The two landscape renders
  // share one composition to within ~2%. Below 760px there is no crossfade:
  // phones get the dedicated portrait render of the energized house as the
  // one and only frame (the .lit layer is display:none there, and its mobile
  // source points at the same file so nothing extra downloads).
  const photoCommon = { sizes: "100vw", fill: true } as const;
  const { props: basePhoto } = getImageProps({
    ...photoCommon,
    alt: t("imageAlt"),
    src: "/images/v2/hero-night.jpeg",
  });
  const {
    props: { srcSet: baseMobile },
  } = getImageProps({ ...photoCommon, alt: t("imageAlt"), src: "/images/v2/hero-solar-mobile.jpeg" });
  const { props: litPhoto } = getImageProps({
    ...photoCommon,
    alt: "",
    src: "/images/v2/hero-solar.jpeg",
  });
  const {
    props: { srcSet: litMobile },
  } = getImageProps({ ...photoCommon, alt: "", src: "/images/v2/hero-solar-mobile.jpeg" });

  return (
    <section className={styles.hero} data-hero="">
      <picture>
        <source media="(max-width: 760px)" srcSet={baseMobile} />
        <img {...basePhoto} className={styles.photo} loading="eager" fetchPriority="high" />
      </picture>
      {/* Lit twin, eager-loaded so the first reveal crossfades without a pop-in. */}
      <picture>
        <source media="(max-width: 760px)" srcSet={litMobile} />
        <img
          {...litPhoto}
          className={clsx(styles.photo, styles.lit)}
          loading="eager"
          aria-hidden="true"
        />
      </picture>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.tagline}>
          {pre}
          <em>{accent}</em>
          {post}
        </p>

        <SinkOnScroll className={styles.displaySink}>
          <h1 className={styles.display}>
            <span className={styles.d1}>{t("display1")}</span>
            <span className={styles.d2}>{t("display2")}</span>
          </h1>
        </SinkOnScroll>

        {/* TODO(olcay): "10 yıl garanti" chip collides with the display word at
            some widths — disabled for now, will return in a different form. */}

        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <div className={styles.actions}>
              {/* Survey first; the five-door gateway right below carries segmentation. */}
              <Button href="/contact" size="lg" withArrow className={styles.heroBtn}>
                {tc("getQuote")}
              </Button>
              <Button
                externalHref="#cozumler"
                newTab={false}
                size="lg"
                variant="glass"
                className={styles.heroBtn}
              >
                {t("ctaSolutions")}
              </Button>
            </div>
            {/* Sayısal vaat (revize 29.07): kanıt üçlüsü — About "Rakamlarla" bandıyla aynı. */}
            <dl className={styles.proof}>
              {(["proof1", "proof2", "proof3"] as const).map((id) => (
                <div key={id} className={styles.proofItem}>
                  <dt>{t(`${id}l`)}</dt>
                  <dd>{t(`${id}v`)}</dd>
                </div>
              ))}
            </dl>
            <Link href="/calculator" className={styles.calcLink}>
              {tc("calculate")} <IconArrowRight size={15} />
            </Link>
          </div>

          <Link href="/calculator" className={styles.calcCard}>
            <span className={styles.calcThumb}>
              <Image src="/images/v2/calc-2.jpg" alt="" width={96} height={72} />
            </span>
            <span className={styles.calcText}>
              <strong>{t("calcCardTitle")}</strong>
              <span>{t("calcCardDesc")}</span>
            </span>
            <span className={styles.calcGo}>
              <IconArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
