import { z } from "zod";

export const PROPERTY_TYPES = ["villa", "detached", "apartment"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

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
  propertyType: z.enum(PROPERTY_TYPES),
  bill: z.string().trim().optional(),
  message: z.string().trim().max(1200).optional(),
  product: z.string().trim().max(200).optional(), // catalog group the visitor asked about

  consent: z.literal(true),
  company: z.string().optional(), // honeypot — must stay empty
  token: z.string().optional(), // Turnstile token (verified server-side if configured)
});

export type LeadInput = z.infer<typeof leadSchema>;
