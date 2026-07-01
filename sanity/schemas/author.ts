import { defineType, defineField } from "sanity";

export const author = defineType({
  name: "author",
  title: "Yazar",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Ad", type: "string", validation: (r) => r.required() }),
    defineField({ name: "image", title: "Fotoğraf", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", title: "Kısa tanıtım", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "name", media: "image" } },
});
