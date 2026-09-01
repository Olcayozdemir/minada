import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./SectionHeading.module.scss";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  note,
  align = "left",
  tone = "light",
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  /** A quieter line under the intro, for a caveat or a second thought. */
  note?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Heading level — "h1" when the section opens a page. */
  as?: "h1" | "h2";
}) {
  return (
    <div className={clsx(styles.wrap, styles[align], styles[tone])}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <Heading className={styles.title}>{title}</Heading>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}
