import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects } from "@/sanity/queries";
import { buildReferences } from "@/lib/references";
import { ReferenceGallery } from "./ReferenceGallery";
import styles from "./ReferencesSection.module.scss";

// The ordered list from lib/references (CMS photographs, catalogue copy).
// `as` is "h1" when the gallery opens its own page (/referanslar), "h2" when
// it sits inside another page.
export async function ReferencesSection({
  locale,
  as = "h2",
}: {
  locale: string;
  as?: "h1" | "h2";
}) {
  const t = await getTranslations("Projects");
  const cards = buildReferences(await getProjects(locale), locale, { width: 1200, height: 840 });

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
            business: t("filters.business"),
          }}
          resultLabel={t("resultLabel")}
        >
          <SectionHeading as={as} eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        </ReferenceGallery>
      )}
    </Section>
  );
}
