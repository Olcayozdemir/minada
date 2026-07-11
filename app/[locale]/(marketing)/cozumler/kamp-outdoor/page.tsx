import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { getProductCategories, getProductGroups } from "@/sanity/queries";
import { coverSrc } from "@/sanity/image";
import { buildAlternates } from "@/lib/seo";
import styles from "./camp.module.scss";

export const revalidate = 60;

// Boy rehberi senaryoları + kit render'ları (cam sahne + teal enerji hattı).
// s3 şimdilik indüksiyonlu "uzun mola" kiti; tekne render'ı inince o gelir.
const SCENARIOS = [
  { id: "s1", img: "/images/v2/camp/kit-weekend.jpeg" },
  { id: "s2", img: "/images/v2/camp/kit-kitchen.jpeg" },
  { id: "s3", img: "/images/v2/camp/kit-longstay.jpeg" },
] as const;
const WHY = ["w1", "w2", "w3"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Segments.camp" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/cozumler/kamp-outdoor", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Segments.camp");
  const tc = await getTranslations("Common");

  // Featured shelf: the portable-power category's first visible products.
  const [categories, groups] = await Promise.all([getProductCategories(), getProductGroups()]);
  const cat = categories.find((c) => c.slug === "tasinabilir-guc");
  const shelf = cat ? groups.filter((g) => g.category?._id === cat._id).slice(0, 6) : [];

  return (
    <>
      <section className={styles.hero} data-hero="">
        <Image
          src="/images/v2/camp-hero.jpeg"
          alt=""
          fill
          sizes="100vw"
          priority
          className={styles.heroPhoto}
        />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.intro}>{t("intro")}</p>
          <div className={styles.actions}>
            <Button href={{ pathname: "/contact", query: { konu: "kamp" } }} size="lg" withArrow>
              {tc("getQuote")}
            </Button>
            <Button
              href={{ pathname: "/urunler/[category]", params: { category: "tasinabilir-guc" } }}
              size="lg"
              variant="glass"
            >
              {t("productsCta")}
            </Button>
          </div>
        </div>
      </section>

      <Section tone="light">
        <SectionHeading eyebrow={t("sizeEyebrow")} title={t("sizeTitle")} intro={t("sizeIntro")} />
        <ul className={styles.sizes}>
          {SCENARIOS.map(({ id, img }) => (
            <li key={id} className={styles.sizeCard}>
              <span className={styles.sizeMedia} aria-hidden="true">
                <Image
                  src={img}
                  alt=""
                  width={640}
                  height={358}
                  sizes="(max-width: 860px) 92vw, 380px"
                  className={styles.sizeImg}
                />
              </span>
              <div className={styles.sizeBody}>
                <h3 className={styles.sizeTitle}>{t(`${id}.title`)}</h3>
                <p className={styles.sizeGear}>{t(`${id}.gear`)}</p>
                <p className={styles.sizePick}>
                  <IconCheck size={15} /> {t(`${id}.pick`)}
                </p>
                <p className={styles.sizeDesc}>{t(`${id}.desc`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {shelf.length > 0 ? (
        <Section tone="sand">
          <SectionHeading eyebrow={t("productsEyebrow")} title={t("productsTitle")} />
          <ul className={styles.shelf}>
            {shelf.map((g) => (
              <li key={g._id}>
                <Link
                  href={{
                    pathname: "/urunler/[category]",
                    params: { category: "tasinabilir-guc" },
                  }}
                  className={styles.shelfCard}
                >
                  {g.image ? (
                    <span className={styles.shelfStage}>
                      <Image
                        src={typeof g.image === "string" ? g.image : coverSrc(g.image, 360)}
                        alt=""
                        width={360}
                        height={240}
                        sizes="(max-width: 700px) 60vw, 220px"
                        className={styles.shelfImg}
                      />
                    </span>
                  ) : null}
                  <span className={styles.shelfTitle}>{g.title}</span>
                  {g.powerRange ? <span className={styles.shelfPower}>{g.powerRange}</span> : null}
                  <span className={styles.shelfFootRow} aria-hidden="true">
                    <span className={styles.shelfRule} />
                    <span className={styles.shelfGo}>
                      <IconArrowRight size={15} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.shelfFoot}>
            <Button
              href={{ pathname: "/urunler/[category]", params: { category: "tasinabilir-guc" } }}
              variant="secondary"
              withArrow
            >
              {t("productsCta")}
            </Button>
          </div>
        </Section>
      ) : null}

      <Section tone="light">
        <SectionHeading title={t("whyTitle")} />
        <ul className={styles.why}>
          {WHY.map((id) => (
            <li key={id} className={styles.whyItem}>
              <h3 className={styles.whyTitle}>{t(`${id}.title`)}</h3>
              <p className={styles.whyDesc}>{t(`${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="dark">
        <div className={styles.cta}>
          <div>
            <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
            <p className={styles.ctaDesc}>{t("ctaDesc")}</p>
          </div>
          <Button href={{ pathname: "/contact", query: { konu: "kamp" } }} size="lg" withArrow>
            {tc("getQuote")}
          </Button>
        </div>
      </Section>
    </>
  );
}
