import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
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

  return (
    <section className={styles.hero}>
      <Image
        src="/images/v2/hero.jpg"
        alt={t("imageAlt")}
        fill
        preload
        sizes="100vw"
        className={styles.photo}
      />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.tagline}>
          {pre}
          <em>{accent}</em>
          {post}
        </p>

        <h1 className={styles.display}>
          <span className={styles.d1}>{t("display1")}</span>
          <PanelGlyph className={styles.glyph} />
          <span className={styles.d2}>{t("display2")}</span>
        </h1>

        <div className={styles.houseCard} aria-hidden="true" />
        <div className={styles.house} aria-hidden="true">
          <Image
            src="/hero/hero-home-alt.png"
            alt=""
            width={760}
            height={424}
            sizes="(max-width: 900px) 380px, 640px"
            className={styles.houseImg}
          />
        </div>

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

        <div className={styles.chipWarranty}>
          <strong>{t("chipWarrantyValue")}</strong>
          <span>{t("chipWarrantyLabel")}</span>
        </div>

        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <p className={styles.sub}>{t("subtitle")}</p>
            <div className={styles.actions}>
              <Button href="/contact" size="lg" withArrow>
                {tc("getQuote")}
              </Button>
              <Button href="/calculator" size="lg" variant="glass">
                {tc("calculate")}
              </Button>
            </div>
          </div>

          <Link href="/calculator" className={styles.calcCard}>
            <span className={styles.calcThumb}>
              <Image src="/images/v2/calc.jpg" alt="" width={96} height={72} />
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
