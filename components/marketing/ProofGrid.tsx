"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import clsx from "clsx";
import styles from "./Proof.module.scss";

export type ProofPhoto = {
  id: string;
  title: string;
  /** "Antalya · 1,18 MW", or "" when neither is known. */
  meta: string;
  /** The type line, "Endüstriyel çatı GES". */
  kind: string;
  src: string;
  w: number;
  h: number;
};

/* Six photographs on an even grid, three across.

   This started as a staggered mosaic and did not work: fourteen drone
   frames of roofs read as one grey field at that size, and columns of
   uneven heights read as untidy rather than editorial (Olcay,
   2026-09-02). Six frames of the same shape, large enough to see, say more
   about the work than fourteen that cannot be made out.

   Each raises a small readout naming the plant; a mouse raises it by
   hovering, a finger or a keyboard by pressing, and that press state is
   the only reason this is a client component. */
export function ProofGrid({ photos, label }: { photos: ProofPhoto[]; label: string }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className={styles.grid} aria-label={label}>
      {photos.map((p, i) => {
        const pressed = open === p.id;
        return (
          <li key={p.id} className={styles.cell} style={{ "--d": i } as CSSProperties}>
            <button
              type="button"
              className={clsx(styles.tile, pressed && styles.pressed)}
              aria-pressed={pressed}
              onClick={() => setOpen(pressed ? null : p.id)}
            >
              <span className={styles.frame}>
                <span className={styles.window}>
                  <Image
                    src={p.src}
                    alt=""
                    width={p.w}
                    height={p.h}
                    sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw"
                    className={styles.photo}
                  />
                </span>
              </span>
              {/* The readout: a lead line up from the photograph, then the
                  card. Purely visual pieces are hidden from the
                  accessibility tree. */}
              <span className={styles.lead} aria-hidden="true" />
              <span className={styles.card}>
                <span className={clsx(styles.line, styles.cardTitle)}>
                  <span className={styles.dot} aria-hidden="true" />
                  {p.title}
                </span>
                {p.meta ? (
                  <span className={clsx(styles.line, styles.cardMeta)}>{p.meta}</span>
                ) : null}
                {p.kind ? (
                  <span className={clsx(styles.line, styles.cardKind)}>{p.kind}</span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
