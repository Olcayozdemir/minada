"use client";

import clsx from "clsx";
import styles from "./RoofSim.module.scss";

// Visual cap so the roof stays readable on huge areas (slider max keeps us
// well below this anyway).
const MAX_SLOTS = 60;

const VIEW_W = 360;
const BASE_Y = 168; // roof eave line
const GROUND_Y = 214;
const SKEW = 34; // roof depth shift

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * A little house whose roof plane carries the simulation: `max` mounting
 * slots (ghost outlines) sized by the roof area, the first `installed`
 * filled with live panels. The whole house grows with the area and panels
 * pop in with a stagger.
 */
export function RoofSim({ installed, max }: { installed: number; max: number }) {
  const slots = clamp(max, 1, MAX_SLOTS);
  const lit = clamp(installed, 0, slots);

  const cols = clamp(Math.ceil(Math.sqrt(slots * 1.7)), 3, 10);
  const rows = Math.ceil(slots / cols);
  const cellW = Math.min(30, 300 / cols);
  const cellH = Math.min(16, 92 / rows);
  const roofW = cols * cellW;
  const rise = rows * cellH;
  const x0 = (VIEW_W - (roofW + SKEW)) / 2;

  // Roof parallelogram corners + cell lattice.
  const bl = [x0, BASE_Y];
  const e1 = [roofW, 0]; // along the eave
  const e2 = [SKEW, -rise]; // up the slope
  const pt = (i: number, j: number): [number, number] => [
    bl[0] + (e1[0] * i) / cols + (e2[0] * j) / rows,
    bl[1] + (e1[1] * i) / cols + (e2[1] * j) / rows,
  ];
  const f = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

  const cells = Array.from({ length: slots }, (_, idx) => {
    const i = idx % cols;
    const j = Math.floor(idx / cols);
    let a = pt(i, j);
    let b = pt(i + 1, j);
    let c = pt(i + 1, j + 1);
    let d = pt(i, j + 1);
    const ctr: [number, number] = [
      (a[0] + b[0] + c[0] + d[0]) / 4,
      (a[1] + b[1] + c[1] + d[1]) / 4,
    ];
    const k = 0.13;
    const toward = (p: [number, number]): [number, number] => [
      p[0] + (ctr[0] - p[0]) * k,
      p[1] + (ctr[1] - p[1]) * k,
    ];
    a = toward(a);
    b = toward(b);
    c = toward(c);
    d = toward(d);
    return { idx, i, j, points: `${f(a)} ${f(b)} ${f(c)} ${f(d)}` };
  });

  const doorW = clamp(roofW * 0.16, 13, 19);
  const doorH = 27;
  const doorX = x0 + roofW / 2 - doorW / 2;
  const scale = 0.85 + 0.3 * clamp(slots / MAX_SLOTS, 0, 1);

  return (
    <div className={styles.scene} aria-hidden="true">
      <svg viewBox={`0 0 ${VIEW_W} 236`} className={styles.svg}>
        <defs>
          <linearGradient id="simPanel" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor="#2c5c90" />
            <stop offset="1" stopColor="#0b2140" />
          </linearGradient>
          <radialGradient id="simSun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffc24d" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffc24d" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sun */}
        <circle cx="312" cy="44" r="46" fill="url(#simSun)" />
        <circle cx="312" cy="44" r="13" fill="#f2a82c" />

        <g className={styles.house} style={{ transform: `scale(${scale.toFixed(3)})` }}>
          {/* ground shadow */}
          <ellipse
            cx={x0 + roofW / 2 + SKEW / 2}
            cy={GROUND_Y + 7}
            rx={(roofW + SKEW) / 2 + 12}
            ry={7.5}
            fill="rgba(4, 14, 28, 0.45)"
          />
          {/* front wall */}
          <rect
            x={x0}
            y={BASE_Y}
            width={roofW}
            height={GROUND_Y - BASE_Y}
            rx={3}
            fill="#e7edf5"
            stroke="#0b2140"
            strokeWidth={1.6}
          />
          {/* window (only on wider houses) */}
          {roofW > 88 && (
            <rect
              x={x0 + 10}
              y={BASE_Y + 10}
              width={14}
              height={14}
              rx={2}
              fill="rgba(96, 214, 234, 0.4)"
              stroke="#16375e"
              strokeWidth={1.2}
            />
          )}
          {/* door */}
          <rect
            x={doorX}
            y={GROUND_Y - doorH}
            width={doorW}
            height={doorH}
            rx={2}
            fill="#16375e"
          />
          <circle cx={doorX + doorW - 3.4} cy={GROUND_Y - doorH / 2} r={1.4} fill="#ffc24d" />
          {/* roof plane */}
          <polygon
            points={`${f(pt(0, 0))} ${f(pt(cols, 0))} ${f(pt(cols, rows))} ${f(pt(0, rows))}`}
            fill="#081a30"
            stroke="#0b2140"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* panel slots */}
          {cells.map(({ idx, i, j, points }) => (
            <polygon
              key={idx}
              points={points}
              className={clsx(styles.slot, idx < lit && styles.on)}
              style={{ transitionDelay: `${i * 22 + j * 30}ms` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
