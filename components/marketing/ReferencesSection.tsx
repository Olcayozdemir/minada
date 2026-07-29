import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import styles from "./ReferencesSection.module.scss";

// MW-scale systems read as "12 MW" / "4,6 MW", smaller ones stay in kWp.
function capacityLabel(kw: number, locale: string): string {
  return kw >= 1000 ? `${(kw / 1000).toLocaleString(locale)} MW` : `${kw.toLocaleString(locale)} kWp`;
}

// Reference projects gallery (shown on the About page). Data comes from Sanity;
// shows an empty state until reference projects are published.
export async function ReferencesSection({ locale }: { locale: string }) {
  const t = await getTranslations("Projects");
  const projects = await getProjects(locale);

  return (
    <Section tone="light">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      {projects.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
          <p className={styles.emptyDesc}>{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => (
            <article key={p._id} className={styles.card}>
              {p.coverImage ? (
                <span className={styles.cover}>
                  <Image
                    src={urlFor(p.coverImage).width(700).height(500).url()}
                    alt={p.title}
                    width={700}
                    height={500}
                    className={styles.coverImg}
                  />
                </span>
              ) : null}
              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <div className={styles.tags}>
                  {p.location ? <span className={styles.tag}>{p.location}</span> : null}
                  {p.systemKw ? (
                    <span className={styles.tag}>{capacityLabel(p.systemKw, locale)}</span>
                  ) : null}
                </div>
                {p.excerpt ? <p className={styles.excerpt}>{p.excerpt}</p> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
