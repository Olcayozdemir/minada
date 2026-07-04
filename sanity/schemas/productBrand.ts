import { defineType, defineField } from "sanity";

// Manufacturer/brand (CW Enerji, TommaTech, ...).
export const productBrand = defineType({
  name: "productBrand",
  title: "Ürün Markası",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Marka adı", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title", media: "logo" } },
});
