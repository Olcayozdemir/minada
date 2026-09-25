import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { getProjects } from "@/sanity/queries";
import { buildReferences } from "@/lib/references";
import { ProofGrid, type ProofPhoto } from "./ProofGrid";
import { ProofQuotes } from "./ProofQuotes";
import styles from "./Proof.module.scss";

/* The reference list (lib/references) rotates three equal cards at a time;
   below, the four real customer quotes sit side by side. Add a fifth quote
   by adding a key to QUOTES and its `Home.proof.tN` copy in both locales. */
const QUOTES = ["t1", "t2", "t3", "t4"] as const;

export async function Proof({ locale }: { locale: string }) {
  const t = await getTranslations("Home.proof");
  const projectsT = await getTranslations("Projects");

  const photos: ProofPhoto[] = buildReferences(await getProjects(locale), locale, {
    width: 1200,
    height: 800,
  }).flatMap((item) =>
    item.image
      ? [
          {
            id: item.id,
            title: item.title,
            location: item.location,
            capacity: item.power,
            src: item.image.src,
            w: item.image.width,
            h: item.image.height,
          },
        ]
      : [],
  );

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
      />

      <ProofQuotes
        quotes={QUOTES.map((id) => ({
          id,
          quote: t(`${id}.quote`),
          name: t(`${id}.name`),
        }))}
        eyebrow={t("quotesTitle")}
        title={t("quotesHeading")}
        label={t("quotesLabel")}
        privacyNote={t("quotesPrivacy")}
      />
    </Section>
  );
}
