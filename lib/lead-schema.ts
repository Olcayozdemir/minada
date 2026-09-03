import { z } from "zod";

// The four residential options were all a business could pick from, so a
// factory enquiry had nothing to choose (Okan, Notion §2, approved
// 2026-09-02). "Yapı tipi" rather than "Konut tipi" for the same reason.
export const PROPERTY_TYPES = [
  "villa",
  "detached",
  "apartment",
  "office",
  "factory",
  "land",
  "other",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

// Lead routing topic — mirrors the four doors (CTA'lar ?konu= ile taşır).
export const LEAD_TOPICS = ["ges", "depolama", "isi-pompasi", "ev-sarj", "diger"] as const;
export type LeadTopic = (typeof LEAD_TOPICS)[number];

// Turkish mobile: strip non-digits, drop 90/0 prefix, expect 5XXXXXXXXX.
function isTrMobile(v: string) {
  const d = v.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  return /^5\d{9}$/.test(d);
}

export const leadSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().refine(isTrMobile),
  email: z.email(),
  city: z.string().trim().min(2),
  // Required: a lead without a property type cannot be sized, and Okan asked
  // that the form refuse to submit without it. The select still submits "" when
  // untouched, so the enum alone is what rejects it.
  propertyType: z.enum(PROPERTY_TYPES),
  topic: z.union([z.enum(LEAD_TOPICS), z.literal("")]).optional(),
  bill: z.string().trim().optional(),
  message: z.string().trim().max(1200).optional(),
  product: z.string().trim().max(200).optional(), // catalog group the visitor asked about

  consent: z.literal(true),
  company: z.string().optional(), // honeypot — must stay empty
  token: z.string().optional(), // Turnstile token (verified server-side if configured)
});

export type LeadInput = z.infer<typeof leadSchema>;
