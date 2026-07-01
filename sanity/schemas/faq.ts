import { defineType, defineField } from "sanity";
import { languageField } from "./language";

export const faq = defineType({
  name: "faq",
  title: "SSS",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Soru", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Cevap", type: "text", rows: 4, validation: (r) => r.required() }),
    languageField,
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "question", subtitle: "language" } },
});
