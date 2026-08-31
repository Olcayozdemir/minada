"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { DESKTOP_CIRCUIT, MOBILE_CIRCUIT, roundedPath, type Circuit } from "./heroCircuitPath";
import styles from "./HeroCircuit.module.scss";

/**
 * "Live circuit" — the cable runs drawn into the hero render carry a packet of
 * light: gold down from the panels, and once the inverter flashes, volt-blue
 * out to the battery, the heat pump and the car. The whole thing is the
 * headline said out loud: üret, depola, yönet.
 *
 * Mounted inside Hero's `.dots` plane, which already reproduces the photo's
 * object-fit geometry — so the runs stay welded to the cables at any crop,
 * exactly like the numbered markers do.
 *
 * Decorative and inert: no DOM measuring, no scroll listener, no library. One
 * shared six-second CSS cycle drives every packet and every marker ping (see
 * the module stylesheet); this component only stops the clock while the hero
 * is off screen.
 */
export function HeroCircuit() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => el.toggleAttribute("data-run", entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.wrap} data-run="">
      <Plane id="wide" circuit={DESKTOP_CIRCUIT} className={styles.wide} />
      <Plane id="tall" circuit={MOBILE_CIRCUIT} className={styles.tall} />
    </div>
  );
}

const RUNS = ["trunk", "battery", "heatpump", "ev"] as const;

function Plane({
  id,
  circuit,
  className,
}: {
  id: string;
  circuit: Circuit;
  className: string;
}) {
  return (
    <svg className={clsx(styles.svg, className)} viewBox={circuit.viewBox} aria-hidden="true">
      <defs>
        <radialGradient id={`hero-flash-${id}`}>
          <stop offset="0" className={styles.flash0} />
          <stop offset="0.55" className={styles.flash1} />
          <stop offset="1" className={styles.flash2} />
        </radialGradient>
      </defs>

      {RUNS.map((run) => {
        // pathLength normalises every run to 100 units, so one dash figure
        // describes the bead on all four regardless of real length. Three
        // strokes of falling width and opacity stand in for a radial falloff:
        // at bead size the steps read as one soft point of light, and it costs
        // plain paint instead of a per-frame filter.
        const d = roundedPath(circuit[run]);
        return (
          <g key={run} className={styles[run]}>
            <path className={styles.glow} d={d} pathLength={100} />
            <path className={styles.halo} d={d} pathLength={100} />
            <path className={styles.core} d={d} pathLength={100} />
          </g>
        );
      })}

      {/* DC becomes AC: the inverter face lights the moment the trunk lands. */}
      <circle
        className={clsx(styles.pop, styles.convert)}
        cx={circuit.inverter[0]}
        cy={circuit.inverter[1]}
        r="58"
        fill={`url(#hero-flash-${id})`}
      />
      {/* …and the charge port answers when the car's packet arrives. */}
      <circle
        className={clsx(styles.pop, styles.arrive)}
        cx={circuit.carPort[0]}
        cy={circuit.carPort[1]}
        r="44"
        fill={`url(#hero-flash-${id})`}
      />
    </svg>
  );
}
