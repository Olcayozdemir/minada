import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { getProjects } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { capacityLabel } from "./ReferencesSection";
import { ProofGrid, type ProofPhoto } from "./ProofGrid";
import { ProofQuotes } from "./ProofQuotes";
import styles from "./Proof.module.scss";

/* The one section of the home page that is not a render.

   Above: six photographs shot on the customers' own roofs, on an even grid
   (ProofGrid). Each raises a small readout on hover or tap that names the
   plant, its province and its power. Below: four customers quoted under
   their own names. Both headings are Okan's own words (WhatsApp,
   2026-09-02), which is why the band carries two rather than one. The photographs come from the same Sanity set as
   /referanslar, which is where the rest of them live; the quotes are the
   ones Okan collected in Notion ("Okan'a sorular" §4, 2026-09-02). The
   three invented quotes that used to sit here were removed on 2026-07-11;
   these are real, so the section is back.

   The five stars are the house's reading, not the customer's: none of the
   four was asked for a score, and Olcay asked for them anyway (2026-09-02)
   because they carry. The number is a field rather than a constant in the
   markup, so a customer who says otherwise is a one-line change.

   The section stays off the page until at least one project is published
   rather than announcing an empty grid. Add a fifth quote by adding a key
   to QUOTES and its `Home.proof.tN` copy in both locales. */
const QUOTES = ["t1", "t2", "t3", "t4"] as const;

/** Three across, two deep. The rest of the work is on /referanslar. */
const SHOWN = 6;

/** 16:10, the shape drone frames come in, asked of Sanity for every one. */
const CROP_W = 800;
const CROP_H = 500;

export async function Proof({ locale }: { locale: string }) {
  const t = await getTranslations("Home.proof");
  const projects = (await getProjects(locale)).filter((p) => p.coverImage);
  if (projects.length === 0) return null;

  // A plant with its power on it says more than one without, so those come
  // first; the order within each group is the dataset's own, which is the
  // publish order Olcay controls from the studio.
  const ordered = [...projects].sort(
    (a, b) => Number(Boolean(b.systemKw)) - Number(Boolean(a.systemKw)),
  );

  const photos: ProofPhoto[] = ordered.slice(0, SHOWN).map((p) => ({
    id: p._id,
    title: p.title,
    meta: [p.location, p.systemKw ? capacityLabel(p.systemKw, locale) : null]
      .filter(Boolean)
      .join(" · "),
    kind: p.excerpt ?? "",
    src: urlFor(p.coverImage).width(CROP_W).height(CROP_H).fit("crop").auto("format").url(),
    w: CROP_W,
    h: CROP_H,
  }));

  return (
    <Section tone="light" className={styles.section}>
      <div className={styles.head}>
        <SectionHeading title={t("title")} />
        <Link href="/projects" className={styles.all}>
          {t("all")} <IconArrowRight size={16} />
        </Link>
      </div>

      <ProofGrid photos={photos} label={t("list")} />

      <ProofQuotes
        quotes={QUOTES.map((id) => ({
          id,
          quote: t(`${id}.quote`),
          name: t(`${id}.name`),
          rating: 5,
        }))}
        title={t("quotesTitle")}
        label={t("quotesLabel")}
      />
    </Section>
  );
}
