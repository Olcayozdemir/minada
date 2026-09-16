import { defineType, defineField, defineArrayMember } from "sanity";
import { languageField } from "./language";

export const projectReference = defineType({
  name: "projectReference",
  title: "Referans / Proje",
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
    defineField({ name: "location", title: "Konum", type: "string" }),
    defineField({
      name: "projectType",
      title: "Proje türü",
      type: "string",
      options: {
        list: [
          { title: "Konut", value: "residential" },
          { title: "Ticari", value: "commercial" },
          { title: "Endüstriyel", value: "industrial" },
        ],
        layout: "radio",
      },
    }),
    defineField({ name: "systemKw", title: "Sistem gücü (kWp)", type: "number" }),
    defineField({ name: "acKw", title: "AC gücü (kWe)", type: "number" }),
    defineField({ name: "excerpt", title: "Özet", type: "text", rows: 3 }),
    defineField({ name: "coverImage", title: "Kapak görseli", type: "image", options: { hotspot: true } }),
    defineField({
      name: "gallery",
      title: "Galeri",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),
    defineField({
      name: "publishedAt",
      title: "Tarih",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({ name: "body", title: "İçerik", type: "blockContent" }),
  ],
  preview: { select: { title: "title", subtitle: "location", media: "coverImage" } },
});
