import clsx from "clsx";
import styles from "./RotatingSeal.module.scss";

/**
 * Kinetic type seal: the brand line set on a circle, spinning slowly like a
 * compass card. Decorative stamp for the final CTA (the "drop anchor" beat);
 * hidden from assistive tech, frozen under prefers-reduced-motion.
 */
export function RotatingSeal({ text, className }: { text: string; className?: string }) {
  return (
    <span className={clsx(styles.seal, className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" className={styles.ring}>
        <defs>
          {/* Full circle (r 38) starting at 12 o'clock; circumference ~238.8. */}
          <path id="minada-seal-arc" d="M 50 12 a 38 38 0 1 1 -0.01 0" fill="none" />
        </defs>
        <text className={styles.text}>
          <textPath href="#minada-seal-arc" textLength="238" lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
      </svg>
    </span>
  );
}
