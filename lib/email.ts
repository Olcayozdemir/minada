import { Resend } from "resend";
import type { LeadInput } from "./lead-schema";

const PROPERTY_LABELS: Record<string, string> = {
  villa: "Villa",
  detached: "Müstakil ev",
  apartment: "Apartman",
  office: "İşyeri / Ofis",
  factory: "Fabrika / Tesis",
  land: "Arazi",
  other: "Diğer",
};

const TOPIC_LABELS: Record<string, string> = {
  ges: "Güneş Enerjisi (GES)",
  depolama: "Enerji Depolama",
  "isi-pompasi": "Isı Pompası",
  "ev-sarj": "EV Şarj",
  diger: "Diğer",
};

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
  );
}

// Sends the lead notification via Resend. The API route treats a missing key as
// an error so the visitor is never shown a false-success state.
export async function sendLeadEmail(data: LeadInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL ?? "info@minada.com.tr";
  const from = process.env.RESEND_FROM ?? "MİNADA <onboarding@resend.dev>";

  if (!apiKey) {
    // Talebin tek kopyası bu log satırı — uyarı değil, hata.
    console.error("[lead] RESEND_API_KEY not set — LEAD LOST:", JSON.stringify(data));
    return { sent: false as const };
  }

  const rows: [string, string][] = [
    ["Ad Soyad", data.name],
    ["Telefon", data.phone],
    ["E-posta", data.email],
    ["Şehir", data.city],
    ["Konu", data.topic ? (TOPIC_LABELS[data.topic] ?? data.topic) : "—"],
    ["Yapı tipi", data.propertyType ? (PROPERTY_LABELS[data.propertyType] ?? data.propertyType) : "—"],
    ["Aylık fatura", data.bill || "—"],
    ["İlgilenilen ürün", data.product || "—"],
    ["Mesaj", data.message || "—"],
  ];
  const html = `<h2 style="font-family:sans-serif;color:#0f2a4a">Yeni teklif talebi</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="font-weight:600;color:#0f2a4a">${k}</td><td>${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject: `Yeni teklif talebi${data.topic ? ` [${TOPIC_LABELS[data.topic] ?? data.topic}]` : ""} — ${data.name}`,
    html,
  });
  if (error) {
    console.error("[lead] resend error:", error);
    throw new Error("email_failed");
  }
  return { sent: true as const };
}
