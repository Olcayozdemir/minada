import { defineType, defineField } from "sanity";
import { languageField } from "./language";

export const testimonial = defineType({
  name: "testimonial",
  title: "Görüş / Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Görüş", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "name", title: "Ad", type: "string", validation: (r) => r.required() }),
    defineField({ name: "location", title: "Konum / rol", type: "string" }),
    defineField({
      name: "rating",
      title: "Puan (1–5)",
      type: "number",
      initialValue: 5,
      validation: (r) => r.min(1).max(5),
    }),
    languageField,
  ],
  preview: { select: { title: "name", subtitle: "location" } },
});
