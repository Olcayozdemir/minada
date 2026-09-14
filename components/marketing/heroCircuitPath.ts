// Pure geometry for the hero "live circuit".
//
// The cable runs are already drawn into the hero renders: a line leaves the
// panel array, comes down the wall into the inverter, and fans out to the
// battery, the heat pump and the wallbox. Static in the photo. These are those
// runs traced as polylines, so a bead of light can be sent down them.
//
// Coordinates are in each render's own pixel space (hero-solar.jpeg is
// 1920x1072, hero-solar-mobile-modern.webp is 941x1672), so the SVG viewBox is
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

/* hero-solar-mobile-modern.webp — the selected 9:16 mobile render. The paths
   below trace only the cables visible in that render. */
export const MOBILE_CIRCUIT: Circuit = {
  viewBox: "0 0 941 1672",
  trunk: [
    [634, 770],
    [652, 795],
    [652, 815],
    [632, 827],
    [632, 898],
    [651, 900],
    [651, 978],
    [633, 989],
    [633, 1097],
  ],
  battery: [
    [532, 1148], // inverter underside to the battery's left-hand input
    [532, 1170],
    [555, 1170],
    [572, 1160],
    [572, 1128],
  ],
  heatpump: [
    [573, 1245], // wall-foot strip from the battery toward the heat pump
    [520, 1248],
    [465, 1249],
    [410, 1249],
    [355, 1249],
    [310, 1249],
  ],
  ev: [
    [460, 1140], // wallbox underside
    [469, 1185],
    [471, 1225],
    [478, 1245],
    [520, 1251],
    [575, 1255],
    [620, 1273], // slack loop on the drive
    [646, 1280],
    [656, 1265],
    [655, 1220],
    [660, 1198],
    [680, 1178], // charge port
  ],
  inverter: [530, 1120],
  carPort: [680, 1178],
};
