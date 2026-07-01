import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Ayarları",
  type: "document",
  fields: [
    defineField({ name: "phone", title: "Telefon", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp no (ülke koduyla, rakam)", type: "string" }),
    defineField({ name: "email", title: "E-posta", type: "string" }),
    defineField({ name: "address", title: "Adres", type: "text", rows: 2 }),
    defineField({ name: "workingHours", title: "Çalışma saatleri", type: "string" }),
    defineField({
      name: "social",
      title: "Sosyal medya",
      type: "object",
      fields: [
        defineField({ name: "instagram", type: "url" }),
        defineField({ name: "linkedin", type: "url" }),
      ],
    }),
    defineField({ name: "footerText", title: "Footer metni", type: "text", rows: 2 }),
  ],
  preview: { prepare: () => ({ title: "Site Ayarları" }) },
});
