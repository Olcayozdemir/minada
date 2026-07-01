import createImageUrlBuilder from "@sanity/image-url";
import { dataset, studioProjectId } from "./env";

const builder = createImageUrlBuilder({ projectId: studioProjectId, dataset });

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
