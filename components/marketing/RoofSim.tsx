"use client";

import clsx from "clsx";
import styles from "./RoofSim.module.scss";

// Visual cap so the roof stays readable on huge areas (slider max keeps us
// well below this anyway).
const MAX_SLOTS = 60;

const VIEW_W = 360;
const VIEW_H = 250;
const BASE_Y = 178; // roof eave line
const GROUND_Y = 222;
const SKEW = 34; // roof depth shift

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Sparkle positions along the sun→roof light stream (hand-tuned).
const SPARKS: Array<[number, number, number]> = [
  [296, 58, 1.6],
  [272, 74, 1.2],
  [251, 88, 1.8],
  [232, 96, 1.1],
  [214, 106, 1.5],
  [196, 112, 1.0],
  [262, 66, 1.0],
  [240, 82, 1.3],
  [156, 64, 1.2],
  [120, 92, 1.0],
];

/**
 * Glassmorphic house scene: frosted-glass house with a warm interior glow,
 * sun streaming light onto the roof, floating glass dashboard cards, and a
 * roof plane carrying the simulation — `max` mounting slots sized by the
 * roof area, the first `installed` filled with live panels.
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

  // Roof parallelogram lattice.
  const bl = [x0, BASE_Y];
  const e1 = [roofW, 0];
  const e2 = [SKEW, -rise];
  const pt = (i: number, j: number): [number, number] => [
    bl[0] + (e1[0] * i) / cols + (e2[0] * j) / rows,
    bl[1] + (e1[1] * i) / cols + (e2[1] * j) / rows,
  ];
  const f = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

  const cells = Array.from({ length: slots }, (_, idx) => {
    const i = idx % cols;
    const j = Math.floor(idx / cols);
    const a = pt(i, j);
    const b = pt(i + 1, j);
    const c = pt(i + 1, j + 1);
    const d = pt(i, j + 1);
    const ctr: [number, number] = [
      (a[0] + b[0] + c[0] + d[0]) / 4,
      (a[1] + b[1] + c[1] + d[1]) / 4,
    ];
    const k = 0.13;
    const toward = (p: [number, number]): [number, number] => [
      p[0] + (ctr[0] - p[0]) * k,
      p[1] + (ctr[1] - p[1]) * k,
    ];
    return {
      idx,
      i,
      j,
      points: `${f(toward(a))} ${f(toward(b))} ${f(toward(c))} ${f(toward(d))}`,
    };
  });

  const doorW = clamp(roofW * 0.16, 13, 19);
  const doorH = 27;
  const doorX = x0 + roofW / 2 - doorW / 2;
  const scale = 0.85 + 0.3 * clamp(slots / MAX_SLOTS, 0, 1);

  // Roof centre — target of the light stream.
  const roofC = pt(cols / 2, rows / 2);

  return (
    <div className={styles.scene} aria-hidden="true">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={styles.svg}>
        <defs>
          <radialGradient id="simBgGlow" cx="50%" cy="42%" r="60%">
            <stop offset="0" stopColor="#2c5c90" stopOpacity="0.55" />
            <stop offset="1" stopColor="#2c5c90" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="simSun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd98a" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#ffc24d" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffc24d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="simStream" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffc24d" stopOpacity="0.65" />
            <stop offset="1" stopColor="#ffc24d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="simGlassPanel" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#bfe3f2" stopOpacity="0.75" />
            <stop offset="0.5" stopColor="#5f92c4" stopOpacity="0.65" />
            <stop offset="1" stopColor="#16375e" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="simWarm" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffc24d" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ffc24d" stopOpacity="0" />
          </radialGradient>
          <filter id="simBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* ambient scene glow */}
        <ellipse cx={VIEW_W / 2} cy={130} rx={200} ry={120} fill="url(#simBgGlow)" />

        {/* sun */}
        <circle cx="316" cy="42" r="42" fill="url(#simSun)" />
        <circle cx="316" cy="42" r="12" fill="#ffce6b" />
        <circle cx="316" cy="42" r="12" fill="url(#simSun)" opacity="0.9" />

        {/* light stream from the sun to the roof */}
        <path
          d={`M 312 46 C 268 62, ${roofC[0] + 60} ${roofC[1] - 34}, ${roofC[0].toFixed(1)} ${roofC[1].toFixed(1)}`}
          stroke="url(#simStream)"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
          filter="url(#simBlur)"
          opacity="0.55"
        />
        <path
          d={`M 312 46 C 270 64, ${roofC[0] + 52} ${roofC[1] - 26}, ${roofC[0].toFixed(1)} ${roofC[1].toFixed(1)}`}
          stroke="url(#simStream)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* sparkles */}
        {SPARKS.map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="#ffd98a"
            className={styles.spark}
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}

        {/* floating glass cards */}
        <g className={styles.cardFloat}>
          <g transform="translate(18 66) rotate(-4)">
            <rect width="74" height="46" rx="8" className={styles.glassCard} />
            <polyline
              points="10,32 22,22 32,27 44,14 56,20 64,12"
              fill="none"
              stroke="rgba(255,214,138,0.85)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
        <g className={styles.cardFloatAlt}>
          <g transform={`translate(${VIEW_W - 78} 128) rotate(4)`}>
            <rect width="62" height="44" rx="8" className={styles.glassCard} />
            {[0, 1, 2, 3].map((b) => (
              <rect
                key={b}
                x={11 + b * 12}
                y={32 - (8 + b * 5)}
                width="7"
                height={8 + b * 5}
                rx="2"
                fill="rgba(255,214,138,0.8)"
              />
            ))}
          </g>
        </g>

        <g className={styles.house} style={{ transform: `scale(${scale.toFixed(3)})` }}>
          {/* base slab */}
          <rect
            x={x0 - 14}
            y={GROUND_Y - 6}
            width={roofW + SKEW + 24}
            height={10}
            rx={4}
            fill="rgba(238, 242, 247, 0.12)"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth={1}
          />
          <ellipse
            cx={x0 + roofW / 2 + SKEW / 2}
            cy={GROUND_Y + 10}
            rx={(roofW + SKEW) / 2 + 16}
            ry={7}
            fill="rgba(4, 14, 28, 0.4)"
          />

          {/* warm interior glow (shines through the frosted wall) */}
          <ellipse
            cx={x0 + roofW / 2}
            cy={BASE_Y + 22}
            rx={roofW / 2}
            ry={26}
            fill="url(#simWarm)"
            filter="url(#simBlur)"
          />

          {/* frosted front wall */}
          <rect
            x={x0}
            y={BASE_Y}
            width={roofW}
            height={GROUND_Y - BASE_Y}
            rx={3}
            fill="rgba(238, 242, 247, 0.16)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={1.4}
          />
          {/* lit window (wider houses) */}
          {roofW > 88 && (
            <rect
              x={x0 + 10}
              y={BASE_Y + 10}
              width={15}
              height={15}
              rx={2.5}
              fill="rgba(255, 194, 77, 0.75)"
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth={1}
            />
          )}
          {/* glass door with gold knob */}
          <rect
            x={doorX}
            y={GROUND_Y - doorH}
            width={doorW}
            height={doorH}
            rx={2}
            fill="rgba(255, 214, 138, 0.34)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={1.1}
          />
          <circle cx={doorX + doorW - 3.6} cy={GROUND_Y - doorH / 2} r={1.4} fill="#ffc24d" />

          {/* frosted roof plane */}
          <polygon
            points={`${f(pt(0, 0))} ${f(pt(cols, 0))} ${f(pt(cols, rows))} ${f(pt(0, rows))}`}
            fill="rgba(238, 242, 247, 0.14)"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth={1.4}
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
