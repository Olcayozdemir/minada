import { defineType, defineField } from "sanity";
import { languageField } from "./language";

export const post = defineType({
  name: "post",
  title: "Blog Yazısı",
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
    languageField,
    defineField({ name: "excerpt", title: "Özet", type: "text", rows: 3 }),
    defineField({ name: "coverImage", title: "Kapak görseli", type: "image", options: { hotspot: true } }),
    defineField({ name: "category", title: "Kategori", type: "reference", to: [{ type: "category" }] }),
    defineField({ name: "author", title: "Yazar", type: "reference", to: [{ type: "author" }] }),
    defineField({
      name: "publishedAt",
      title: "Yayın tarihi",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({ name: "body", title: "İçerik", type: "blockContent" }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "metaTitle", title: "Meta başlık", type: "string" }),
        defineField({ name: "metaDescription", title: "Meta açıklama", type: "text", rows: 2 }),
        defineField({ name: "ogImage", title: "OG görseli", type: "image" }),
      ],
    }),
  ],
  preview: { select: { title: "title", subtitle: "language", media: "coverImage" } },
});
