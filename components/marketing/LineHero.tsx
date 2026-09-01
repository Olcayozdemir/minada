import type { ReactNode } from "react";
import { ViewTransition } from "react";
import clsx from "clsx";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { BUSINESS_LINES, LINE_ART, lineArtName } from "@/lib/site";
import styles from "./LineHero.module.scss";

/**
 * Opening band for a business line page.
 *
 * The four line pages used to open on a heading and a button over flat navy,
 * which gave the reader nothing to recognise them by. Each now carries its own
 * diorama — the same render the homepage gateway card shows.
 *
 * That shared render is the point: it is wrapped in a `ViewTransition` under
 * the same name on both ends, so clicking a gateway card morphs the little
 * diorama on the card into the big one here rather than cutting between two
 * unrelated screens. One object moving, not two objects swapping.
 */
export async function LineHero({
  id,
  namespace,
  topic,
  note,
  children,
  below,
}: {
  /** A `BUSINESS_LINES` id. */
  id: (typeof BUSINESS_LINES)[number]["id"];
  /** Messages namespace holding eyebrow/title/intro, e.g. "Lines.ges". */
  namespace: string;
  /** `konu` query the quote form should open with. */
  topic: string;
  /** A quieter line under the intro, e.g. what the single-partner scope covers. */
  note?: string;
  /** Small things that belong beside the copy, e.g. a row of figures. */
  children?: ReactNode;
  /** Anything that needs the band's full width, e.g. a wide diagram. */
  below?: ReactNode;
}) {
  const t = await getTranslations(namespace);
  const tc = await getTranslations("Common");
  const line = BUSINESS_LINES.find((l) => l.id === id)!;

  return (
    <Section tone="dark" className={clsx(styles.hero, below && styles.hasBelow)}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <SectionHeading
            as="h1"
            tone="dark"
            eyebrow={t("eyebrow")}
            title={t("title")}
            intro={t("intro")}
            note={note}
          />
          <Button href={{ pathname: "/contact", query: { konu: topic } }} size="lg" withArrow>
            {tc("getQuote")}
          </Button>
          {children}
        </div>

        <div className={styles.stage} aria-hidden="true">
          <ViewTransition name={lineArtName(id)} share="morph">
            <Image
              src={line.art}
              alt=""
              width={LINE_ART.w}
              height={LINE_ART.h}
              sizes="(max-width: 860px) 78vw, 42vw"
              className={styles.art}
              priority
            />
          </ViewTransition>
        </div>
      </div>

      {below ? <div className={styles.below}>{below}</div> : null}
    </Section>
  );
}
