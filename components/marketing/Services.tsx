import { ViewTransition } from "react";
import Image, { getImageProps } from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { BUSINESS_LINES, LINE_ART, lineArtName } from "@/lib/site";
import styles from "./Services.module.scss";

// The four business-line doors. Renders as the homepage gateway (dark band)
// and as the /services hub. Ids, routes and dioramas come from BUSINESS_LINES,
// which the line pages read too — see lineArtName for why that matters.

/** A small optimised variant of a diorama, for use as a CSS mask. */
function maskSrc(src: string): string {
  const { props } = getImageProps({ src, alt: "", width: 320, height: 239, quality: 45 });
  return props.src;
}

export async function Services({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const t = await getTranslations("Home.gateway");

  return (
    <Section tone="dark" id="cozumler" className={styles.band}>
      <div className={styles.head}>
        <SectionHeading
          as={headingAs}
          tone="dark"
          eyebrow={t("eyebrow")}
          title={t("title")}
          intro={t("intro")}
        />
      </div>
      <ul className={styles.grid}>
        {BUSINESS_LINES.map(({ id, href, art }) => (
          <li key={id}>
            <Link href={href} className={styles.card}>
              <span className={styles.stage} aria-hidden="true">
                {/* Named for the morph: clicking through carries this exact
                    render into the line page's own hero (see LineHero). */}
                <ViewTransition name={lineArtName(id)} share="morph">
                  <Image
                    src={art}
                    alt=""
                    width={LINE_ART.w}
                    height={LINE_ART.h}
                    sizes="(max-width: 700px) 72vw, (max-width: 1100px) 30vw, 19vw"
                    className={styles.stageImg}
                  />
                </ViewTransition>
                {/* Rake light. Masked to the render's own alpha, so on hover
                    the light crosses the object rather than washing the panel
                    behind it — the diorama stops being a flat PNG and becomes
                    something sitting under a lamp. The mask is a deliberately
                    small variant (a mask needs coverage, not sharpness) taken
                    through the same optimiser as the image itself. */}
                <span
                  className={styles.rake}
                  style={{ ["--art" as string]: `url(${maskSrc(art)})` }}
                />
              </span>
              <span className={styles.body}>
                <span className={styles.chips}>{t(`${id}.chips`)}</span>
                <span className={styles.cardTitle}>{t(`${id}.title`)}</span>
                <span className={styles.cardDesc}>{t(`${id}.desc`)}</span>
                <span className={styles.foot} aria-hidden="true">
                  <span className={styles.rule} />
                  <span className={styles.go}>
                    <IconArrowRight size={16} />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
