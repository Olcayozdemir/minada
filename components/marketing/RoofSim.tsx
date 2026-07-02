"use client";

import clsx from "clsx";
import styles from "./RoofSim.module.scss";

// Visual cap so the grid stays readable on huge roofs (slider max keeps us
// below this anyway).
const MAX_SLOTS = 60;

/**
 * Tilted roof-plane grid: `max` mounting slots, the first `installed` filled
 * with live panels. Panels fade/scale in with a small stagger as the inputs
 * change — the "simulation" feel.
 */
export function RoofSim({ installed, max }: { installed: number; max: number }) {
  const slots = Math.min(max, MAX_SLOTS);
  const lit = Math.min(installed, slots);
  const cols = Math.min(10, Math.max(4, Math.ceil(Math.sqrt(slots * 1.8))));

  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.plane} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: slots }, (_, i) => (
          <span
            key={i}
            className={clsx(styles.slot, i < lit && styles.on)}
            style={{ transitionDelay: `${(i % cols) * 22 + Math.floor(i / cols) * 34}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
