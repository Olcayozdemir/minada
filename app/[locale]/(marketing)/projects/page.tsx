import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildAlternates } from "@/lib/seo";
import styles from "./projects.module.scss";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("projects"), alternates: buildAlternates("/projects", locale) };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
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
                  {p.systemKw ? <span className={styles.tag}>{p.systemKw} kWp</span> : null}
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
