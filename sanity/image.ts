import createImageUrlBuilder from "@sanity/image-url";
import { dataset, studioProjectId } from "./env";

const builder = createImageUrlBuilder({ projectId: studioProjectId, dataset });

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

// Cover images are Sanity image objects normally, but plain public/ paths in
// the static fallback datasets. Resolve either to a usable src.
export function coverSrc(source: unknown, w: number, h?: number): string {
  if (typeof source === "string") return source;
  let img = urlFor(source as Parameters<typeof builder.image>[0]).width(w);
  if (h) img = img.height(h);
  return img.url();
}
