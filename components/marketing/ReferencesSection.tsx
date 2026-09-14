import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { LOCAL_REFERENCE_PROJECTS } from "./localReferenceProjects";
import styles from "./ReferencesSection.module.scss";

// MW-scale systems read as "1,18 MW", smaller ones stay in kWp ("941,76 kWp").
// Shared with the home page strip (ReferencesStrip) so both read the same.
export function capacityLabel(kw: number, locale: string): string {
  const opts = { maximumFractionDigits: 2 };
  return kw >= 1000
    ? `${(kw / 1000).toLocaleString(locale, opts)} MW`
    : `${kw.toLocaleString(locale, opts)} kWp`;
}

// Published Sanity projects lead the gallery; the supplied Antalya projects
// follow them. `as` is "h1" when the gallery opens its own page (/referanslar),
// "h2" when it sits inside another page.
export async function ReferencesSection({
  locale,
  as = "h2",
}: {
  locale: string;
  as?: "h1" | "h2";
}) {
  const t = await getTranslations("Projects");
  const localT = await getTranslations("Home.proof.localProjects");
  const projects = await getProjects(locale);
  const cards = [
    ...projects.map((project) => ({
      id: project._id,
      title: project.title,
      location: project.location ?? "",
      capacity: project.systemKw ? capacityLabel(project.systemKw, locale) : "",
      excerpt: project.excerpt ?? "",
      image: project.coverImage
        ? {
            src: urlFor(project.coverImage).width(700).height(500).url(),
            width: 700,
            height: 500,
          }
        : null,
    })),
    ...LOCAL_REFERENCE_PROJECTS.map((project) => ({
      id: `local:${project.id}`,
      title: localT(`${project.translationKey}.title`),
      location: project.location,
      capacity: "",
      excerpt: localT(`${project.translationKey}.kind`),
      image: {
        src: project.src,
        width: project.width,
        height: project.height,
      },
    })),
  ];

  return (
    <Section tone="light">
      <SectionHeading as={as} eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      {cards.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
          <p className={styles.emptyDesc}>{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {cards.map((project) => (
            <article key={project.id} className={styles.card}>
              {project.image ? (
                <span className={styles.cover}>
                  <Image
                    src={project.image.src}
                    alt={project.title}
                    width={project.image.width}
                    height={project.image.height}
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    className={styles.coverImg}
                  />
                </span>
              ) : null}
              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{project.title}</h3>
                <div className={styles.tags}>
                  {project.location ? <span className={styles.tag}>{project.location}</span> : null}
                  {project.capacity ? <span className={styles.tag}>{project.capacity}</span> : null}
                </div>
                {project.excerpt ? <p className={styles.excerpt}>{project.excerpt}</p> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
