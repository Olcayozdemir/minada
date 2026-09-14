import Image, { getImageProps } from "next/image";
import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { HeroCircuit } from "./HeroCircuit";
import styles from "./Hero.module.scss";

/**
 * Wraps the commas so they can be set smaller than the words around them.
 *
 * At the display size Bricolage's comma is a heavy blob, and the headline has
 * two of them carrying the whole rhythm of "üret, depola, yönet". CSS cannot
 * reach a single character, so the only way to size one is to give it an
 * element. Splitting on the glyph rather than writing the markup into the
 * message keeps the translations plain text, and a line that loses its commas
 * simply comes back unchanged.
 */
function withSmallCommas(text: string) {
  return text.split(/(,)/).map((part, i) =>
    part === "," ? (
      <span key={i} className={styles.comma}>
        ,
      </span>
    ) : (
      part
    ),
  );
}

export async function Hero() {
  const t = await getTranslations("Hero");
  const tc = await getTranslations("Common");

  // "Sinematik Panorama" (Hero Keşif 1d): tek ışıklı kare, soldan navy geçişli
  // scrim, sol blokta başlık + alt metin + CTA'lar, sağ altta hesaplayıcı kartı.
  // Eski alacakaranlık/ışıklı crossfade ikilisi kalktı.
  // NOT: tasarım dosyasındaki hero-settled/hero-mobile.webp, aşağıdaki iki
  // dosyanın 1200px'e küçültülmüş kopyalarıydı (algısal fark 1/256) ve tam
  // ekranda yumuşak görünüyordu. Kadraj birebir aynı olduğu için yüksek
  // çözünürlüklü orijinallere dönüldü; ürün noktalarının yüzdeleri geçerli.
  const photoCommon = { sizes: "100vw", fill: true } as const;
  const { props: photo } = getImageProps({
    ...photoCommon,
    alt: t("imageAlt"),
    src: "/images/v2/hero-solar.jpeg",
  });
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    ...photoCommon,
    alt: "",
    src: "/images/v2/hero-solar-mobile-modern.webp",
  });

  return (
    <section className={styles.hero} data-hero="">
      <picture>
        <source media="(max-width: 760px)" srcSet={mobileSrcSet} />
        <img
          {...photo}
          src={photo.src}
          alt={photo.alt}
          className={styles.photo}
          loading="eager"
          fetchPriority="high"
        />
      </picture>
      <div className={styles.scrim} aria-hidden="true" />

      {/* Ürün işaretleri (1d): 1 GES · 2 depolama · 3 EV şarj · 4 ısı pompası.
          Düzlem, fotoğrafın cover kırpımını kopyalar; koordinatlar görsel-uzayı
          yüzdesi olduğundan kadraj değişse de nokta ürünün üstünde kalır.
          Devre katmanı aynı düzlemin içinde: render'a çizili kabloları o da
          görsel-uzayı koordinatıyla izliyor, yani kırpım ne olursa olsun ışık
          kablonun üstünden geçiyor. Noktalar da paketleri kendi sıralarında
          karşılıyor (ping gecikmeleri HeroCircuit'in altı saniyelik saatine
          bağlı — birini oynatırsan ötekini de oynat). */}
      <div className={styles.dots} aria-hidden="true">
        <HeroCircuit />
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={clsx(styles.dot, styles[`dot${n}`])}>
            {n}
            <span className={styles.tip}>{t(`marker${n}`)}</span>
          </span>
        ))}
      </div>

      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={styles.display}>
            <span className={styles.d1}>{withSmallCommas(t("display1"))}</span>
            <em className={styles.d2}>{t("display2")}</em>
          </h1>

          <div className={styles.lower}>
            {/* Mobil, ürün işaretlerine yer açmak için kısa versiyonu gösterir (3d). */}
            <p className={clsx(styles.sub, styles.subDesktop)}>{t("sub")}</p>
            <p className={clsx(styles.sub, styles.subMobile)}>{t("subMobile")}</p>
            <div className={styles.actions}>
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
          </div>
        </div>

        <div className={styles.bottom}>
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
