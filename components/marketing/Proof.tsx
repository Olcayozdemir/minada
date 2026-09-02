import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { getProjects } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { capacityLabel } from "./ReferencesSection";
import { ProofMosaic } from "./ProofMosaic";
import { ProofQuotes } from "./ProofQuotes";
import { CROP_WIDTH, cropHeight, dealColumns, type ProofColumn } from "./proofColumns";
import styles from "./Proof.module.scss";

/* The one section of the home page that is not a render.

   Above: photographs shot on the customers' own roofs, pinned up in
   staggered columns that gather around the heading (proofColumns.ts,
   ProofMosaic). Each photograph raises
   a small glass readout on hover or tap that names the plant, its province
   and its power. Below: four customers quoted under
   their own names. The photos come from the same Sanity set as
   /referanslar; the quotes are the ones Okan collected in Notion ("Okan'a
   sorular" §4, 2026-09-02). The three invented quotes that used to sit here
   were removed on 2026-07-11; these are real, so the section is back.

   The section stays off the page until at least one project is published
   rather than announcing an empty board. Add a fifth quote by adding a key
   to QUOTES and its `Home.proof.tN` copy in both locales. */
const QUOTES = ["t1", "t2", "t3", "t4"] as const;

export async function Proof({ locale }: { locale: string }) {
  const t = await getTranslations("Home.proof");
  const projects = (await getProjects(locale)).filter((p) => p.coverImage);
  if (projects.length === 0) return null;

  // Deal the photographs into the mosaic's columns; each slot's height
  // decides its crop, so a tall slot gets an upright frame.
  let next = 0;
  const columns: ProofColumn[] = dealColumns(projects.length).map((col) => ({
    top: col.top,
    deep: col.deep,
    tiles: col.heights.map((height) => {
      const p = projects[next++];
      const meta = [p.location, p.systemKw ? capacityLabel(p.systemKw, locale) : null]
        .filter(Boolean)
        .join(" · ");
      const h = cropHeight(height);
      return {
        id: p._id,
        title: p.title,
        meta,
        kind: p.excerpt ?? "",
        src: urlFor(p.coverImage).width(CROP_WIDTH).height(h).fit("crop").auto("format").url(),
        w: CROP_WIDTH,
        h,
        height,
      };
    }),
  }));

  return (
    <Section tone="light" className={styles.section}>
      <ProofMosaic columns={columns} label={t("list")}>
        <div className={styles.headline}>
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.intro}>{t("intro")}</p>
          <Link href="/projects" className={styles.all}>
            {t("all")} <IconArrowRight size={16} />
          </Link>
        </div>
      </ProofMosaic>

      {/* One quote at a time, swiped: the quotes are long and unequal, and
          four across a desktop row squeezed every one into a narrow column
          (Olcay, 2026-09-02). */}
      <ProofQuotes
        quotes={QUOTES.map((id) => ({ id, quote: t(`${id}.quote`), name: t(`${id}.name`) }))}
        label={t("quotesLabel")}
      />
    </Section>
  );
}
