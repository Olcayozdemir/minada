import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { dataset, studioProjectId } from "./sanity/env";

// Catalog docs get their own "Katalog" folder in the Studio; everything else
// keeps the default type list.
const CATALOG_TYPES = ["productCategory", "productBrand", "productGroup"];

export default defineConfig({
  name: "minada",
  title: "MİNADA",
  projectId: studioProjectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("İçerik")
          .items([
            S.listItem()
              .title("Katalog")
              .child(
                S.list()
                  .title("Katalog")
                  .items([
                    S.documentTypeListItem("productCategory").title("Kategoriler"),
                    S.documentTypeListItem("productBrand").title("Markalar"),
                    S.documentTypeListItem("productGroup").title("Ürün Grupları"),
                  ]),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !CATALOG_TYPES.includes(item.getId() ?? ""),
            ),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
});
