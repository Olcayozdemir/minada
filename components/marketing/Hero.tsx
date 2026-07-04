import Image, { getImageProps } from "next/image";
import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { SinkOnScroll } from "./SinkOnScroll";
import styles from "./Hero.module.scss";

// Gold panel-stroke glyph — the tilted segment motif lifted from the logo,
// standing in for the "bolt" between the two display words.
function PanelGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 92" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="heroGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--gold-300)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <g transform="skewX(-13)">
        <rect x="24" y="2" width="15" height="26" rx="4" fill="url(#heroGold)" />
        <rect x="24" y="33" width="15" height="26" rx="4" fill="url(#heroGold)" />
        <rect x="24" y="64" width="15" height="26" rx="4" fill="url(#heroGold)" />
      </g>
    </svg>
  );
}

export async function Hero() {
  const t = await getTranslations("Hero");
  const tc = await getTranslations("Common");
  const tagline = t("tagline");
  const accent = t("taglineAccent");
  const [pre, post] = tagline.split(accent);

  // Two pixel-aligned frames of the same house at dusk: the base sits with a
  // bare roof and the lights off; the lit twin has the solar system installed
  // and powered on — warm interiors plus the teal energy path from panel →
  // battery → charger → car. On hover the lit frame crossfades in (pure CSS,
  // see .lit). Landscape-only pair — no art-directed mobile crop, so the shared
  // .photo object-position handles narrow crops.
  const photoCommon = { sizes: "100vw", fill: true } as const;
  const { props: basePhoto } = getImageProps({
    ...photoCommon,
    alt: t("imageAlt"),
    src: "/images/v2/Modern_house_in_garden_dusk_202607041801.jpeg",
  });
  const { props: litPhoto } = getImageProps({
    ...photoCommon,
    alt: "",
    src: "/images/v2/House_with_solar_system_installed_202607041802.jpeg",
  });

  return (
    <section className={styles.hero} data-hero="">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...basePhoto} className={styles.photo} loading="eager" fetchPriority="high" />
      {/* Lit twin, eager-loaded so the first hover crossfades without a pop-in. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...litPhoto}
        className={clsx(styles.photo, styles.lit)}
        loading="eager"
        aria-hidden="true"
      />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.tagline}>
          {pre}
          <em>{accent}</em>
          {post}
        </p>

        <SinkOnScroll className={styles.displaySink}>
          <h1 className={styles.display}>
            <span className={styles.d1}>
              <PanelGlyph className={styles.glyph} />
              {t("display1")}
            </span>
            <span className={styles.d2}>{t("display2")}</span>
          </h1>
        </SinkOnScroll>

        <div className={styles.chipSaving}>
          <svg className={styles.ring} width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(238,242,247,0.18)" strokeWidth="3.2" />
            <circle
              cx="22"
              cy="22"
              r="17"
              fill="none"
              stroke="var(--gold-300)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="107"
              strokeDashoffset="11"
              transform="rotate(-90 22 22)"
            />
          </svg>
          <div>
            <strong>{t("chipSavingValue")}</strong>
            <span>{t("chipSavingLabel")}</span>
          </div>
        </div>

        {/* TODO(olcay): "10 yıl garanti" chip collides with the display word at
            some widths — disabled for now, will return in a different form. */}

        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <p className={styles.sub}>{t("subtitle")}</p>
            <div className={styles.actions}>
              {/* Primary segment entries; the free-survey CTA steps back to secondary. */}
              <Button href="/cozumler/evim-icin" size="lg" withArrow>
                {t("segmentHome")}
              </Button>
              <Button href="/cozumler/isletmem-icin" size="lg" variant="glass">
                {t("segmentBusiness")}
              </Button>
              <Button href="/contact" size="lg" variant="glass" className={styles.calcBtn}>
                {tc("getQuote")}
              </Button>
            </div>
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
