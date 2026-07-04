import { defineType, defineField } from "sanity";

// Catalog category (e.g. "Güneş Panelleri", "İnverterler"). Language-neutral —
// product docs are shared across locales; UI copy is localized in messages.
export const productCategory = defineType({
  name: "productCategory",
  title: "Ürün Kategorisi",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Başlık", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
    defineField({
      name: "icon",
      title: "İkon anahtarı",
      type: "string",
      description: "panel | inverter | battery | mounting | evcharge",
    }),
    defineField({ name: "image", title: "Görsel", type: "image", options: { hotspot: true } }),
  ],
  orderings: [
    { title: "Sıra", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "title", media: "image" } },
});
