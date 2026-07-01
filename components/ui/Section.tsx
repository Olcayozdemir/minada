import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Section.module.scss";

type Tone = "light" | "sand" | "dark" | "band";

export function Section({
  tone = "light",
  id,
  className,
  children,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={clsx(styles.section, styles[tone], className)}>
      <div className={styles.inner}>{children}</div>
    </section>
  );
}
