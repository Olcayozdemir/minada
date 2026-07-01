import { defineType, defineField } from "sanity";
import { languageField } from "./language";

export const service = defineType({
  name: "service",
  title: "Hizmet",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Başlık", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    languageField,
    defineField({ name: "excerpt", title: "Özet", type: "text", rows: 2 }),
    defineField({ name: "icon", title: "İkon anahtarı", type: "string", description: "solar | storage | ev | heatpump" }),
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
    defineField({ name: "body", title: "İçerik", type: "blockContent" }),
  ],
  preview: { select: { title: "title", subtitle: "language" } },
});
