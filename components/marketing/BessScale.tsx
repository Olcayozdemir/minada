import styles from "./BessScale.module.scss";

/**
 * Scale marks for the three BESS use cases.
 *
 * The section's whole point is size — a wall unit against a rack bank against a
 * container — and the cards were saying it in words only. Each mark draws the
 * actual hardware for its tier with a 1.75m figure standing next to it, at that
 * tier's own scale. Read across the three cards the figure shrinks from
 * shoulder-height on the wall unit to knee-height on the container, which is
 * the comparison the numbers underneath only state.
 *
 * A scale figure is the drawing convention for exactly this, and it keeps the
 * marks honest: they are diagrams of equipment, not pictures of MİNADA's work.
 */

const VB = { w: 200, h: 112 };
const GROUND = 98;
const FIGURE_M = 1.75;

/* Metres to viewBox units, per mark. Each tier is drawn at its own zoom — the
   wall unit at true relative scale would be a speck beside a container — and
   the figure carries the comparison instead: 91 units tall on the home mark,
   60 on the rack, 42 on the container. A closer set than that and the first
   two cards read as the same size. */
const SCALE = { home: 52, ci: 34, utility: 24 } as const;

function Figure({ cx, u }: { cx: number; u: number }) {
  const h = FIGURE_M * u;
  const top = GROUND - h;
  const headR = h * 0.072;
  const shoulder = top + h * 0.23;
  const hip = top + h * 0.55;
  const [sw, hw, fw] = [h * 0.125, h * 0.095, h * 0.07];

  return (
    <g className={styles.figure}>
      <circle cx={cx} cy={top + headR * 1.35} r={headR} />
      <path
        d={`M ${cx - sw} ${shoulder} Q ${cx} ${shoulder - h * 0.05} ${cx + sw} ${shoulder}
            L ${cx + hw} ${hip} L ${cx + fw} ${GROUND} L ${cx - fw} ${GROUND} L ${cx - hw} ${hip} Z`}
      />
    </g>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg className={styles.mark} viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true">
      {children}
      <line className={styles.ground} x1="6" y1={GROUND} x2={VB.w - 6} y2={GROUND} />
    </svg>
  );
}

/** Wall-mounted home battery: 0.6 x 1.1 m, hung 0.6 m off the floor. */
function HomeMark() {
  const u = SCALE.home;
  const [w, h] = [0.6 * u, 1.1 * u];
  const x = 46;
  const y = GROUND - 0.6 * u - h;

  return (
    <Frame>
      {/* The wall runs past the unit at both ends, or it reads as a bracket
          rather than as the thing the unit is hung on. */}
      <line className={styles.wall} x1={x - 8} y1="4" x2={x - 8} y2={GROUND} />
      <rect className={styles.body} x={x} y={y} width={w} height={h} rx="3" />
      <line className={styles.detail} x1={x + 5} y1={y + 10} x2={x + w - 5} y2={y + 10} />
      <rect className={styles.charge} x={x + 5} y={y + h - 16} width={w - 10} height="9" rx="2" />
      <path className={styles.detail} d={`M ${x + w / 2} ${y + h} v ${GROUND - y - h}`} />
      <Figure cx={125} u={u} />
    </Frame>
  );
}

/** Commercial rack bank: three 0.6 m cabinets, 2.0 m tall. */
function CiMark() {
  const u = SCALE.ci;
  const [w, h] = [0.6 * u, 2 * u];
  const x0 = 30;

  return (
    <Frame>
      {[0, 1, 2].map((i) => {
        const x = x0 + i * w;
        return (
          <g key={i}>
            <rect className={styles.body} x={x} y={GROUND - h} width={w} height={h} rx="3" />
            {[0.26, 0.44, 0.62, 0.8].map((f) => (
              <line
                key={f}
                className={styles.detail}
                x1={x + 4}
                y1={GROUND - h + h * f}
                x2={x + w - 4}
                y2={GROUND - h + h * f}
              />
            ))}
            <rect
              className={styles.charge}
              x={x + 4}
              y={GROUND - h + 8}
              width={w - 8}
              height="7"
              rx="2"
            />
          </g>
        );
      })}
      <Figure cx={150} u={u} />
    </Frame>
  );
}

/** Utility container: a 20-foot unit, 6.06 x 2.9 m. */
function UtilityMark() {
  const u = SCALE.utility;
  const [w, h] = [6.06 * u, 2.9 * u];
  const x = 10;
  const y = GROUND - h;

  return (
    <Frame>
      <rect className={styles.body} x={x} y={y} width={w} height={h} rx="3" />
      {Array.from({ length: 9 }, (_, i) => x + 14 + i * 12).map((rx) => (
        <line key={rx} className={styles.detail} x1={rx} y1={y + 7} x2={rx} y2={GROUND - 7} />
      ))}
      <rect
        className={styles.door}
        x={x + w - 34}
        y={y + 7}
        width="27"
        height={h - 14}
        rx="2"
      />
      <rect className={styles.charge} x={x + 8} y={y + 6} width="22" height="7" rx="2" />
      <Figure cx={181} u={u} />
    </Frame>
  );
}

const MARKS = { home: HomeMark, ci: CiMark, utility: UtilityMark } as const;

export function BessScaleMark({ id }: { id: keyof typeof MARKS }) {
  const Mark = MARKS[id];
  return <Mark />;
}
