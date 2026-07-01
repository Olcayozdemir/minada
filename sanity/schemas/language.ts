import { defineField } from "sanity";

// Shared language field for document-level i18n (tr/en).
export const languageField = defineField({
  name: "language",
  title: "Dil",
  type: "string",
  options: {
    list: [
      { title: "Türkçe", value: "tr" },
      { title: "English", value: "en" },
    ],
    layout: "radio",
  },
  initialValue: "tr",
  validation: (r) => r.required(),
});
