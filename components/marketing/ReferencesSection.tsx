import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import referenceProjects from "@/content/references.json";
import { LOCAL_REFERENCE_PROJECTS } from "./localReferenceProjects";
import {
  ReferenceGallery,
  type ReferenceCard,
  type ReferenceCategory,
} from "./ReferenceGallery";
import styles from "./ReferencesSection.module.scss";

// MW-scale systems read as "1,18 MW", smaller ones stay in kWp ("941,76 kWp").
// Shared with the home page strip (ReferencesStrip) so both read the same.
export function capacityLabel(kw: number, locale: string): string {
  return kw >= 1000
    ? `${(kw / 1000).toLocaleString(locale, { maximumFractionDigits: 2 })} MW`
    : `${kw.toLocaleString(locale, { maximumFractionDigits: 3 })} kWp`;
}

function acPowerLabel(kw: number, locale: string): string {
  return `${kw.toLocaleString(locale, { maximumFractionDigits: 3 })} kWe`;
}

const projectDetailsBySlug = new Map(
  referenceProjects.map((project) => [project.slug, project] as const),
);

function inferCategory(excerpt: string): ReferenceCategory | undefined {
  // Locale-neutral lowercasing keeps English "Industrial" as an ASCII i;
  // Turkish locale casing would turn it into dotless ı and miss the fallback.
  const value = excerpt.toLowerCase();

  if (
    ["endüstr", "industrial", "tarım", "agri", "arazi", "ground-mount"].some((word) =>
      value.includes(word),
    )
  ) {
    return "industrial";
  }
  if (
    ["ticari", "commercial", "carport", "otopark", "akaryakıt", "petrol"].some((word) =>
      value.includes(word),
    )
  ) {
    return "commercial";
  }
  if (["konut", "residential", "mesken", "villa"].some((word) => value.includes(word))) {
    return "residential";
  }

  return undefined;
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
  const cards: ReferenceCard[] = [
    ...projects.map((project) => {
      const details = projectDetailsBySlug.get(project.slug);
      const systemKw = details?.systemKw ?? project.systemKw;
      const acKw = details?.acKw ?? project.acKw;

      return {
        id: project._id,
        title: details?.title ?? project.title,
        location: project.location ?? "",
        power: [
          systemKw ? capacityLabel(systemKw, locale) : "",
          acKw ? acPowerLabel(acKw, locale) : "",
        ].filter(Boolean),
        category: project.projectType ?? inferCategory(project.excerpt ?? ""),
        image: project.coverImage
          ? {
              src: urlFor(project.coverImage).width(1200).height(840).url(),
              width: 1200,
              height: 840,
            }
          : null,
      };
    }),
    ...LOCAL_REFERENCE_PROJECTS.map((project) => ({
      id: `local:${project.id}`,
      title: localT(`${project.translationKey}.title`),
      location: project.location,
      power: [],
      category: project.category,
      image: {
        src: project.src,
        width: project.width,
        height: project.height,
      },
    })),
  ];

  return (
    <Section tone="light">
      {cards.length === 0 ? (
        <>
          <SectionHeading as={as} eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
            <p className={styles.emptyDesc}>{t("emptyDesc")}</p>
          </div>
        </>
      ) : (
        <ReferenceGallery
          cards={cards}
          filterLabel={t("filterLabel")}
          allLabel={t("filters.all")}
          categoryLabels={{
            residential: t("filters.residential"),
            commercial: t("filters.commercial"),
            industrial: t("filters.industrial"),
          }}
          resultLabel={t("resultLabel")}
        >
          <SectionHeading as={as} eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        </ReferenceGallery>
      )}
    </Section>
  );
}
