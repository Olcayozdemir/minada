import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { dataset, studioProjectId } from "./sanity/env";

export default defineConfig({
  name: "minada",
  title: "MİNADA",
  projectId: studioProjectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
