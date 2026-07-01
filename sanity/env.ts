export const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

// Whether a real Sanity project is configured. Data fetchers short-circuit to
// empty results when false, so the site builds and renders before the project
// ID is provisioned.
export const hasSanity = projectId.length > 0;

// createClient / defineConfig need a non-empty projectId even as a placeholder.
export const studioProjectId = projectId || "placeholder";
