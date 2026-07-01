# MİNADA Enerji — Web

İki dilli (TR/EN), SEO ve performans odaklı tanıtım sitesi. Konut öncelikli;
dört hizmet hattı (güneş enerjisi, batarya depolama, EV şarj, ısı pompası) ve
uygulama alanı segmentleri (konut, ticari/endüstriyel, tarım, kamu). Amaç:
nitelikli lead toplamak.

> Marka: **MİNADA** — "Mina" (güvenli liman) + "Ada" (güven, kalıcılık).
> Mesaj: _"Enerji dönüşümü yolculuğunuzda güvenilir bir liman."_

## Teknoloji

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **React 19**
- **SCSS Modules** (zero-runtime) + `styles/tokens.css` tasarım token'ları
- **Radix UI** (erişilebilir primitifler — dialog, dropdown, …)
- **next-intl** — `tr` (varsayılan) / `en`, yerelleştirilmiş rotalar + `hreflang`
- İleride: **Sanity** (blog/CMS), **React Hook Form + Zod**, **Resend**, **Cloudflare Turnstile**
- Hosting: **Vercel**

## Kurulum

```bash
npm install
cp .env.example .env.local   # değerleri doldur
npm run dev                  # http://localhost:3000 → /tr
```

Komutlar: `npm run dev` · `npm run build` · `npm start` · `npm run lint`

## Proje yapısı

```
app/[locale]/(marketing)/     # yerelleştirilmiş sayfalar (header/footer layout)
components/ui/                 # Button, Logo (SCSS ile stillenmiş primitifler)
components/layout/             # Header, Footer, LanguageSwitcher, MobileNav
components/marketing/          # Hero (+ ileride bölümler)
i18n/                          # routing (locale + slug), navigation, request
messages/tr.json | en.json    # çeviri metinleri
styles/tokens.css             # :root tasarım token'ları ("C · Liman Işığı")
styles/globals.scss           # reset + temel stiller
styles/_mixins.scss           # container / glass / breakpoint mixin'leri
lib/                          # fonts (next/font), site config
proxy.ts                      # next-intl middleware (Next 16: middleware→proxy)
```

## Tasarım sistemi — "C · Liman Işığı"

- **Renk:** forest-teal (`#07302A` → `#0E5249`) + honey-gold (`#E4A82A` / `#F5C24B`) + warm paper (`#F6F2E7`).
- **Tipografi:** başlık Bricolage Grotesque, accent kelime Fraunces italik, gövde Manrope (`next/font`, `latin` + `latin-ext`).
- Premium/koyu hero, glassmorphism kartlar. Token'lar tek yerden (`styles/tokens.css`).

## i18n

`/` → varsayılan `tr`'ye yönlendirilir. Rotalar yerelleştirilmiştir:
`/tr/hizmetler` ↔ `/en/services`. Yeni sayfa eklerken slug'ı `i18n/routing.ts`
içindeki `pathnames`'e, metinleri `messages/*.json`'a ekleyin.

## Build sırası (aşamalı)

1. ✅ Scaffold + tasarım sistemi + layout/header/footer + hero
2. Ana sayfa bölümleri + statik tanıtım sayfaları
3. Tasarruf hesaplayıcı (`lib/solar-config.ts` — katsayılar placeholder)
4. Lead form + `/api/lead` + Resend + WhatsApp + Turnstile
5. Sanity: blog + referanslar + SSS + siteSettings
6. SEO (metadata, sitemap, JSON-LD) + analytics + a11y/perf geçişi
7. Vercel deploy

## Deploy (Vercel)

Repoyu Vercel'e bağlayın, `.env.example`'daki değişkenleri tanımlayın, framework
otomatik algılanır (Next.js). `main`'e push → production.
