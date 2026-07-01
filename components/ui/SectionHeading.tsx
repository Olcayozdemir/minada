import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./SectionHeading.module.scss";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={clsx(styles.wrap, styles[align], styles[tone])}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 className={styles.title}>{title}</h2>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </div>
  );
}
