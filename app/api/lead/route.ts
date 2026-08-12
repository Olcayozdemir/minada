import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { sendLeadEmail } from "@/lib/email";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  const data = parsed.data;

  // Honeypot: a bot filled the hidden field → pretend success, drop silently.
  if (data.company && data.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Turnstile (only enforced when a secret is configured).
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const ok = await verifyTurnstile(secret, data.token, request);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "turnstile" }, { status: 400 });
    }
  }

  // Talep e-postadan başka hiçbir yere yazılmıyor: gönderilemediyse kaybolmuş
  // demektir. Bu yüzden `sent: false` da hata sayılır — ziyaretçiye "gönderildi"
  // demek, aranmayı bekleyip aranmayan bir insan bırakır. Hata durumunda form
  // WhatsApp bağlantısını gösteriyor.
  try {
    const result = await sendLeadEmail(data);
    if (!result.sent) {
      return NextResponse.json({ ok: false, error: "email" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function verifyTurnstile(secret: string, token: string | undefined, request: Request) {
  if (!token) return false;
  const ip =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? undefined;
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const out = (await res.json()) as { success?: boolean };
  return out.success === true;
}
