// Pure geometry for the home "energy line": route waypoints from measured
// section boxes, and an orthogonal polyline → rounded SVG path string.

export type Box = { top: number; bottom: number; left: number; right: number };
export type Pt = { x: number; y: number };

const JOG_DROP = 52; // jog runs this far into a section's top padding
const START_RISE = 48; // line is born this far above the hero's bottom edge
const END_RISE = 40; // …and ends this far above the last section's bottom

/** Horizontal inset from a section's edge to the line. Tracks the container
 * gutter so the line rides the empty margin at any viewport width. */
export function sideInset(vw: number, contentMax = 1360): number {
  return Math.max(14, Math.min(36, (vw - contentMax) / 2 - 8));
}

/** Desktop circuit route: born under the hero's center, then a vertical run
 * beside each section — alternating left/right — jogging across inside the
 * empty seam at each section's top padding. Verticals within a section mean
 * the pinned HowItWorks stretch stays jog-free by construction. */
export function buildRoute(sections: Box[], vw: number): Pt[] {
  if (sections.length < 2) return [];
  const inset = sideInset(vw);
  const [hero, ...rest] = sections;
  const pts: Pt[] = [{ x: (hero.left + hero.right) / 2, y: hero.bottom - START_RISE }];
  rest.forEach((s, i) => {
    // Inset "band" sections (rounded dark panels with margin-inline) leave a
    // narrow gutter between panel and viewport edge — ride its midpoint so the
    // line hugs the panel silhouette instead of crowding the cards inside.
    const x =
      i % 2 === 0
        ? s.left > 4
          ? s.left / 2
          : s.left + inset
        : s.right < vw - 4
          ? (s.right + vw) / 2
          : s.right - inset;
    const jogY = s.top + JOG_DROP;
    pts.push({ x: pts[pts.length - 1].x, y: jogY }, { x, y: jogY });
  });
  const last = rest[rest.length - 1];
  pts.push({ x: pts[pts.length - 1].x, y: last.bottom - END_RISE });
  return dedupe(pts);
}

/** Mobile route: one straight run near the left edge. */
export function buildMobileRoute(sections: Box[]): Pt[] {
  if (sections.length < 2) return [];
  const hero = sections[0];
  const last = sections[sections.length - 1];
  return [
    { x: 16, y: hero.bottom - START_RISE },
    { x: 16, y: last.bottom - END_RISE },
  ];
}

/** Circuit nodes sit on every corner plus the line's endpoint. */
export function cornerPoints(pts: Pt[]): Pt[] {
  if (pts.length < 2) return [];
  return [...pts.slice(1, -1), pts[pts.length - 1]];
}

/** Orthogonal polyline → SVG path, corners rounded with quadratic curves. */
export function toRoundedPath(pts: Pt[], r = 24): string {
  if (pts.length < 2) return "";
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const n = pts[i + 1];
    const rr = Math.min(r, dist(p, c) / 2, dist(c, n) / 2);
    const a = toward(c, p, rr);
    const b = toward(c, n, rr);
    d += ` L ${f(a.x)} ${f(a.y)} Q ${f(c.x)} ${f(c.y)} ${f(b.x)} ${f(b.y)}`;
  }
  const e = pts[pts.length - 1];
  return `${d} L ${f(e.x)} ${f(e.y)}`;
}

function dedupe(pts: Pt[]): Pt[] {
  return pts.filter(
    (p, i) => i === 0 || Math.abs(p.x - pts[i - 1].x) > 0.5 || Math.abs(p.y - pts[i - 1].y) > 0.5
  );
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Point `d` px away from `from`, toward `to`. */
function toward(from: Pt, to: Pt, d: number): Pt {
  const len = dist(from, to) || 1;
  return { x: from.x + ((to.x - from.x) / len) * d, y: from.y + ((to.y - from.y) / len) * d };
}
