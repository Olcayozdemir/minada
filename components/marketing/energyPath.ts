// Pure geometry for the home "energy line": a smooth serpentine that flows
// down the page center, plus the helper that turns it into an SVG path.

export type Box = { top: number; bottom: number; left: number; right: number };
export type Pt = { x: number; y: number };

const START_RISE = 48; // line is born this far above the hero's bottom edge
const END_RISE = 40; // …and ends this far above the last section's bottom
const EDGE_HOLD = 170; // side run starts/ends this far inside a section

/** Wave amplitude around the page center for a given viewport width. */
export function waveAmp(vw: number): number {
  return Math.min(vw * 0.22, 340);
}

/** Route rule: within a section the line holds one side (alternating per
 * section); the sweep across the page center happens in the seam between
 * sections. Two same-x points per section make the in-section run straight,
 * so the pinned HowItWorks stretch shows no lateral drift while pinned. */
export function buildWaveRoute(sections: Box[], vw: number): Pt[] {
  if (sections.length < 2) return [];
  const amp = waveAmp(vw);
  const cx = vw / 2;
  const [hero, ...rest] = sections;
  const pts: Pt[] = [{ x: cx, y: hero.bottom - START_RISE }];
  let dir = 1;
  for (const s of rest) {
    const x = cx + dir * amp;
    const hold = Math.min(EDGE_HOLD, (s.bottom - s.top) * 0.3);
    pts.push({ x, y: s.top + hold }, { x, y: s.bottom - hold });
    dir = -dir;
  }
  // Swap the last section's bottom hold for a roomier glide to the center.
  pts.pop();
  const last = rest[rest.length - 1];
  pts.push({ x: cx, y: last.bottom - END_RISE });
  return pts;
}

/** Waypoints → smooth cubic chain with vertical tangents (a flowing wave).
 * Control points never leave each segment's y-span, so y stays monotonic
 * down the path — which the scroll→length lookup relies on. */
export function toWavePath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dy = (b.y - a.y) * 0.42;
    d += ` C ${f(a.x)} ${f(a.y + dy)} ${f(b.x)} ${f(b.y - dy)} ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}
