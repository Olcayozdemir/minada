"use client";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import type { ProofColumn } from "./proofColumns";
import styles from "./Proof.module.scss";

/* The mosaic: staggered columns of site photographs with the heading in the
   notch they leave in the middle (proofColumns.ts). Each photograph raises a
   small readout naming the plant; a mouse raises it by hovering, a finger or
   a keyboard by pressing, and that press state is the only reason this is a
   client component. The heading arrives as children so it stays a server
   component with its own link.

   Each column carries two numbers for the stylesheet: --d, its place from
   the left, which sets when its photographs settle in; and --par, its
   distance from the middle, which sets how far it drifts as the page
   scrolls past. The entrance sweeps rather than opening from the centre,
   because on a board this symmetrical a centre-out order animates the
   columns in pairs and the eye reads that as everything arriving at once
   (Olcay, 2026-09-02). */
export function ProofMosaic({
  columns,
  label,
  children,
}: {
  columns: ProofColumn[];
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className={styles.mosaic}>
      <ul className={styles.columns} aria-label={label}>
        {columns.map((col, i) => {
          // 3.5 at the ends of an eight-column board, 0.5 either side of
          // the middle; a half step because the board has no centre column.
          const fromCentre = Math.abs(i - (columns.length - 1) / 2);
          return (
          <li
            key={col.tiles[0].id}
            className={clsx(styles.column, col.deep && styles.columnDeep)}
            style={
              {
                "--top": `${col.top}px`,
                "--c": i + 1,
                "--d": i,
                "--par": `${Math.round(fromCentre * 6)}px`,
              } as CSSProperties
            }
          >
            {col.tiles.map((p) => {
              const pressed = open === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={clsx(styles.tile, pressed && styles.pressed)}
                  style={{ "--h": `${p.height}px` } as CSSProperties}
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
                        sizes="(max-width: 900px) 44vw, 220px"
                        className={styles.photo}
                      />
                    </span>
                  </span>
                  {/* The readout: a lead line up from the photo, then the
                      glass card. Purely visual pieces are hidden from the
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
              );
            })}
          </li>
          );
        })}
      </ul>

      {children}
    </div>
  );
}
