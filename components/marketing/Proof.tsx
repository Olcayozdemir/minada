import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { getProjects } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { capacityLabel } from "./ReferencesSection";
import { ProofGrid, type ProofPhoto } from "./ProofGrid";
import { ProofQuotes } from "./ProofQuotes";
import { LOCAL_REFERENCE_PROJECTS } from "./localReferenceProjects";
import styles from "./Proof.module.scss";

/* Published Sanity projects and the supplied field photographs feed the
   lead-and-preview gallery above. Below, one of the four real customer quotes
   sits beside a neutral clean-energy photograph. Add a fifth quote by
   adding a key to QUOTES and its `Home.proof.tN` copy in both locales. */
const QUOTES = ["t1", "t2", "t3", "t4"] as const;

/** Six CMS projects lead the set; the four supplied photographs follow. */
const SANITY_SHOWN = 6;

/** One crop serves both the panoramic lead card and the compact previews. */
const CROP_W = 1200;
const CROP_H = 800;

export async function Proof({ locale }: { locale: string }) {
  const t = await getTranslations("Home.proof");
  const projectsT = await getTranslations("Projects");
  const projects = (await getProjects(locale)).filter((p) => p.coverImage);

  // A plant with its power on it says more than one without, so those come
  // first; the order within each group is the dataset's own, which is the
  // publish order Olcay controls from the studio.
  const ordered = [...projects].sort(
    (a, b) => Number(Boolean(b.systemKw)) - Number(Boolean(a.systemKw)),
  );

  const photos: ProofPhoto[] = [
    ...ordered.slice(0, SANITY_SHOWN).map((p) => ({
      id: p._id,
      title: p.title,
      location: p.location ?? "",
      capacity: p.systemKw ? capacityLabel(p.systemKw, locale) : "",
      kind: p.excerpt ?? "",
      src: urlFor(p.coverImage).width(CROP_W).height(CROP_H).fit("crop").auto("format").url(),
      w: CROP_W,
      h: CROP_H,
    })),
    ...LOCAL_REFERENCE_PROJECTS.map((project) => ({
      id: `local:${project.id}`,
      title: t(`localProjects.${project.translationKey}.title`),
      location: project.location,
      capacity: "",
      kind: t(`localProjects.${project.translationKey}.kind`),
      src: project.src,
      w: project.width,
      h: project.height,
    })),
  ];

  return (
    <Section tone="light" className={styles.section}>
      <ProofGrid
        photos={photos}
        label={t("list")}
        eyebrow={projectsT("eyebrow")}
        title={t("title")}
        allLabel={t("all")}
        previousLabel={t("previousProject")}
        nextLabel={t("nextProject")}
        capacityLabel={t("capacity")}
        locationLabel={t("location")}
      />

      <ProofQuotes
        quotes={QUOTES.map((id) => ({
          id,
          quote: t(`${id}.quote`),
          name: t(`${id}.name`),
        }))}
        title={t("quotesTitle")}
        label={t("quotesLabel")}
        previousLabel={t("previousQuote")}
        nextLabel={t("nextQuote")}
        visualSrc="/images/testimonials/solar-panels-sunlight.jpeg"
      />
    </Section>
  );
}
