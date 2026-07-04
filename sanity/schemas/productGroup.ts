import { defineType, defineField, defineArrayMember } from "sanity";

// Catalog showcase unit: a product *series/group* (not a single SKU).
// No prices by design — cards link to the lead form. Warranty is stored as
// numbers so the UI can localize ("12 yıl ürün" / "12-yr product").
// `features` holds short keys (topcon, g2g, bifacial, ...) that the site
// translates; unknown values render as-is, so editors can also type free text.
export const productGroup = defineType({
  name: "productGroup",
  title: "Ürün Grubu",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Grup adı", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "reference",
      to: [{ type: "productCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "brand",
      title: "Marka",
      type: "reference",
      to: [{ type: "productBrand" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "powerRange",
      title: "Güç aralığı",
      type: "string",
      description: "Örn. 655–620 Wp",
    }),
    defineField({
      name: "variants",
      title: "Watt varyantları",
      type: "array",
      of: [defineArrayMember({ type: "number" })],
    }),
    defineField({
      name: "warrantyProductYears",
      title: "Ürün garantisi (yıl)",
      type: "number",
    }),
    defineField({
      name: "warrantyPerformanceYears",
      title: "Performans garantisi (yıl)",
      type: "number",
    }),
    defineField({
      name: "features",
      title: "Öne çıkan özellikler",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Anahtar (topcon, g2g, bifacial, fullBlack, lowLight, positiveTolerance, selfClean, bipv, flexible, portable) veya serbest metin.",
    }),
    defineField({ name: "image", title: "Görsel", type: "image", options: { hotspot: true } }),
    defineField({
      name: "featured",
      title: "Öne çıkan",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "hidden",
      title: "Vitrinde gizle",
      type: "boolean",
      initialValue: false,
      description: "İşaretliyse /urunler vitrininde listelenmez (ör. taşınabilir Easy Life serisi).",
    }),
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Sıra", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", brand: "brand.title", power: "powerRange", media: "image", hidden: "hidden" },
    prepare({ title, brand, power, media, hidden }) {
      return {
        title: `${hidden ? "🚫 " : ""}${title ?? ""}`,
        subtitle: [brand, power].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
