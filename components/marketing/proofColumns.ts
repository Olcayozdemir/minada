/* The mosaic, column by column, as the pinboard reference had it: eight
   columns holding 2 · 3 · 1 · 1 · 1 · 1 · 3 · 2 photographs. The four in the
   middle are single tall frames that stop above the heading; the two pairs
   at either end run deeper, down past the heading, so the words sit in a
   notch with photographs on both sides of them (Olcay's reference,
   2026-09-02).

   `top` is the column's own offset, so no two columns start on the same
   line. `tiles` is the height of each photograph. Both are px at scale 1;
   the stylesheet scales them with --s. `deep` marks the columns that carry
   on down beside the heading. Photographs fill the columns in order, and
   the layouts repeat if there are ever more than fourteen.

   Plain data and a pure function in their own module: Proof.tsx (server)
   builds the columns, with crop URLs, and ProofMosaic.tsx (client) only
   places them. */
export const COLUMN_WIDTH = 220;
export const CROP_WIDTH = 440;

const LAYOUTS: { top: number; deep: boolean; tiles: number[] }[] = [
  { top: 56, deep: true, tiles: [190, 210] },
  { top: 16, deep: true, tiles: [150, 150, 150] },
  { top: 44, deep: false, tiles: [235] },
  { top: 0, deep: false, tiles: [280] },
  { top: 0, deep: false, tiles: [280] },
  { top: 44, deep: false, tiles: [235] },
  { top: 16, deep: true, tiles: [150, 150, 150] },
  { top: 56, deep: true, tiles: [190, 210] },
];

export type ProofTile = {
  id: string;
  title: string;
  /** "Antalya · 1,18 MW", or "" when neither is known. */
  meta: string;
  /** The type line, "Endüstriyel çatı GES". */
  kind: string;
  src: string;
  /** Crop size requested, for next/image. */
  w: number;
  h: number;
  /** Rendered height in px at scale 1. */
  height: number;
};

export type ProofColumn = { top: number; deep: boolean; tiles: ProofTile[] };

/** Crop height that keeps the column's proportion at CROP_WIDTH. */
export function cropHeight(tileHeight: number): number {
  return Math.round((CROP_WIDTH * tileHeight) / COLUMN_WIDTH);
}

/**
 * Deals `count` photographs into columns, layout by layout, and returns for
 * each the heights its slots should take. The caller turns those into tiles
 * with real crops.
 */
export function dealColumns(count: number): { top: number; deep: boolean; heights: number[] }[] {
  const cols: { top: number; deep: boolean; heights: number[] }[] = [];
  let left = count;
  for (let c = 0; left > 0; c++) {
    const layout = LAYOUTS[c % LAYOUTS.length];
    const heights = layout.tiles.slice(0, left);
    cols.push({ top: layout.top, deep: layout.deep, heights });
    left -= heights.length;
  }
  return cols;
}
