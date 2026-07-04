// Pure geometry for the home "energy line": a smooth serpentine that flows
// down the page center, plus the helper that turns it into an SVG path.

export type Box = { top: number; bottom: number; left: number; right: number };
export type Pt = { x: number; y: number };

const START_RISE = 48; // line is born this far above the hero's bottom edge
const END_RISE = 40; // …and ends this far above the last section's bottom
const SEGMENT_MAX = 900; // add extra bends inside very tall sections

/** Wave amplitude around the page center: wide, so the crests ride out by
 * the page edges and the center is only crossed passing between them. */
export function waveAmp(vw: number): number {
  return Math.min(vw * 0.34, 500);
}

/** Serpentine route: born under the hero's center, then one crest per section
 * (extra crests inside tall ones), alternating sides of the page center —
 * a continuous wave, no straight runs. */
export function buildWaveRoute(sections: Box[], vw: number): Pt[] {
  if (sections.length < 2) return [];
  const amp = waveAmp(vw);
  const cx = vw / 2;
  const [hero, ...rest] = sections;
  const pts: Pt[] = [{ x: cx, y: hero.bottom - START_RISE }];
  let dir = 1;
  for (const s of rest) {
    const h = s.bottom - s.top;
    const bends = Math.max(1, Math.round(h / SEGMENT_MAX));
    for (let k = 0; k < bends; k++) {
      pts.push({ x: cx + dir * amp, y: s.top + ((k + 0.5) / bends) * h });
      dir = -dir;
    }
  }
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
