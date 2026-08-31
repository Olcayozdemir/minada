// Pure geometry for the hero "live circuit".
//
// The cable runs are already drawn into the hero renders: a line leaves the
// panel array, comes down the wall into the inverter, and fans out to the
// battery, the heat pump and the wallbox. Static in the photo. These are those
// runs traced as polylines, so a bead of light can be sent down them.
//
// Coordinates are in each render's own pixel space (hero-solar.jpeg is
// 1920x1072, hero-solar-mobile.jpeg is 1242x2225), so the SVG viewBox is the
// file's intrinsic size and every number below is a pixel in that file. They
// were traced by scanning the renders rather than by eye: for each slice
// across a run, the brightest pixel against the slice's own median is the
// cable. That matters, because these cables read cyan on the gravel but go
// near-white where they cross the lit wall — anything keyed on colour alone
// loses them halfway down.
//
// Two rules kept the traces honest, and both are load-bearing:
//
//   1. A run stops where the render stops drawing it. The trunk ends at the
//      inverter's top edge, not inside it, because below that line the cable
//      is behind the box. The gap the bead crosses is the inverter, and the
//      flash sits in it.
//   2. Nothing here invents a cable. The wallbox is not wired to the inverter
//      anywhere on screen, so `ev` starts at the wallbox; the heat pump is fed
//      off the lit strip along the wall foot, so `heatpump` starts at the
//      battery's base. The choreography sequences them so both still read as
//      downstream of the inverter.

export type Pt = [number, number];

export type Circuit = {
  /** The source render's intrinsic size. */
  viewBox: string;
  /** Panel array down to the inverter's top edge — carried in gold. */
  trunk: Pt[];
  /** Inverter's underside across to the battery tower. */
  battery: Pt[];
  /** Whatever the render actually draws into the heat pump: the wall-foot
   *  strip off the battery's base on desktop, its own cable off the
   *  inverter on mobile. */
  heatpump: Pt[];
  /** Wallbox down its own cable to the car's charge port. */
  ev: Pt[];
  /** Inverter face: flashes when the trunk bead lands (DC becomes AC). */
  inverter: Pt;
  /** Charge port: glows when the EV bead lands. */
  carPort: Pt;
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/**
 * Polyline to path, with the corners rounded off the way the renders' cables
 * bend. Each interior vertex is cut back along both of its segments (never by
 * more than half of the shorter one, so neighbouring corners cannot eat each
 * other) and the vertex itself becomes the quadratic's control point.
 */
export function roundedPath(pts: Pt[], r = 14): string {
  if (pts.length < 2) return "";
  let d = `M ${round1(pts[0][0])} ${round1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [prev, cur, next] = [pts[i - 1], pts[i], pts[i + 1]];
    const inLen = dist(prev, cur);
    const outLen = dist(cur, next);
    const cut = Math.min(r, inLen / 2, outLen / 2);
    if (cut < 0.5) {
      d += ` L ${round1(cur[0])} ${round1(cur[1])}`;
      continue;
    }
    const a = lerp(cur, prev, cut / inLen);
    const b = lerp(cur, next, cut / outLen);
    d += ` L ${round1(a[0])} ${round1(a[1])} Q ${round1(cur[0])} ${round1(cur[1])} ${round1(b[0])} ${round1(b[1])}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${round1(last[0])} ${round1(last[1])}`;
}

/* hero-solar.jpeg — the wide dusk panorama. The house sits in the right third,
   so the whole circuit lives between x 890 and x 1290. */
export const DESKTOP_CIRCUIT: Circuit = {
  viewBox: "0 0 1920 1072",
  trunk: [
    [1176, 441], // cable leaves the array at the roof's lower edge
    [1215, 487], // diagonal down the last panel row
    [1215, 505],
    [1271, 513], // steps right along the fascia
    [1271, 598],
    [1219, 614], // steps back left onto the wall
    [1217, 706], // enters the inverter's top edge
  ],
  battery: [
    [1218, 782], // out of the inverter's underside
    [1222, 801],
    [1231, 807],
    [1288, 807], // battery tower's left flank
  ],
  heatpump: [
    [1290, 899], // battery's base, where the wall-foot strip begins
    [1240, 905],
    [1185, 912],
    [1136, 914], // heat pump's right shoulder
  ],
  ev: [
    [1150, 787], // wallbox underside
    [1153, 860],
    [1158, 897],
    [1166, 918], // cable reaches the gravel
    [1158, 930],
    [1120, 933],
    [1060, 939],
    [1000, 944],
    [955, 948],
    [928, 944], // sweeps back up toward the car
    [913, 932],
    [905, 914],
    [901, 894],
    [897, 874],
    [893, 857], // charge port
  ],
  inverter: [1229, 742],
  carPort: [890, 858],
};

/* hero-solar-mobile.jpeg — a different render, not a crop: the house is seen
   from further left and the four units are lined up along one wall, which
   makes the runs off the inverter much shorter than their desktop
   counterparts (see the per-plane travel windows in the stylesheet). */
export const MOBILE_CIRCUIT: Circuit = {
  viewBox: "0 0 1242 2225",
  trunk: [
    [703, 1222],
    [725, 1275],
    [727, 1337],
    [669, 1362],
    [669, 1530],
  ],
  battery: [
    [690, 1622], // inverter's underside, right-hand cable
    [690, 1648],
    [701, 1660],
    [750, 1660],
  ],
  heatpump: [
    [668, 1622], // inverter's underside, left-hand cable
    [668, 1648],
    [657, 1660],
    [638, 1661],
  ],
  ev: [
    [897, 1615], // wallbox underside
    [895, 1700],
    [899, 1740],
    [910, 1766], // the slack loop resting on the drive
    [930, 1771],
    [946, 1753],
    [953, 1722],
    [959, 1688],
    [968, 1650],
    [974, 1641], // charge port
  ],
  inverter: [682, 1577],
  carPort: [975, 1640],
};
