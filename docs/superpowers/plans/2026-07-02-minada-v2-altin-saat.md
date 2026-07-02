# MİNADA v2 "Altın Saat" Homepage Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the MİNADA homepage to the approved "Altın Saat" design: cinematic golden-hour photo hero with giant display typography, light editorial body with big rounded cards, one dark services band, glass badges on photos only.

**Architecture:** Pure presentation-layer change. All routes, i18n mechanics, forms, calculator logic, Sanity, and SEO stay untouched. `styles/tokens.css` flips to light-first semantics (navy scale retained for dark surfaces); every marketing component keeps its data flow and gets new markup+SCSS. One new component (`Intro`). ~11 Unsplash photos downloaded to `public/images/v2/`.

**Tech Stack:** Next.js 16 App Router (Turbopack), SCSS Modules, next-intl v4, next/image (**Next 16: use `preload`, NOT deprecated `priority`; `qualities` locked to `[75]` default — don't pass `quality`**), Radix Dialog (mobile nav).

**Verification model:** No unit-test infra in this repo. Every task verifies via: `npm run build` (must stay SSG-green for `/tr` + `/en`), `npx eslint .`, and preview-server screenshots (desktop 1280px + mobile 375px) checked against the spec's acceptance notes. Commit after each task.

**Spec:** `docs/superpowers/specs/2026-07-02-minada-v2-altin-saat-redesign-design.md`

**Key repo facts (read before coding):**
- Fonts already loaded via `lib/fonts.ts`: `--font-display` (Bricolage Grotesque 500/600/700), `--font-serif` (Fraunces italic), `--font-body` (Manrope).
- SCSS helpers: `@use "../../styles/mixins" as *;` gives `container`, `glass`, `bp-down($w)`, `bp-up($w)`, `list-reset`.
- `Section` tones: `light | sand | dark | band`; `SectionHeading` props `eyebrow/title/intro/align/tone`.
- `Button` variants `primary | secondary | ghost`, sizes `md | lg`; renders Link/a/button.
- Icons in `components/ui/icons.tsx`: IconSolar, IconBattery, IconEvCharge, IconHeatPump, IconSearch, IconBlueprint, IconInstall, IconSupport, IconHome, IconBuilding, IconLeaf, IconLandmark, IconCalculator, IconCheck, IconArrowRight, IconBolt, IconShield, IconStar.
- Messages: `messages/tr.json` + `messages/en.json` — always edit BOTH.
- `setRequestLocale` gotcha and async `params` already handled in existing pages — don't touch pages except where stated.
- Dev preview: `.claude/launch.json` name `minada` (autoPort). Use preview tools, not raw Bash, for the dev server.

---

## Task 1: Download + verify Unsplash imagery

**Files:**
- Create: `public/images/v2/*.jpg` (11 files)
- Create: `public/images/v2/CREDITS.md`

Unsplash License allows free commercial use without attribution (credits file kept anyway for traceability).

- [ ] **Step 1.1: Fetch candidates per subject via Unsplash public search API**

For each row of this table, run the curl, note the top 2-3 photo ids + raw URLs:

| target file | query |
|---|---|
| `hero.jpg` | `solar panels field sunset aerial` (fallback: `solar farm golden hour`) |
| `service-solar.jpg` | `solar panels house roof` |
| `service-ev.jpg` | `ev charging station home` |
| `service-battery.jpg` | `home battery energy storage` |
| `service-heatpump.jpg` | `heat pump outdoor unit` (fallback: `air source heat pump house`) |
| `area-konut.jpg` | `modern house solar roof` |
| `area-ticari.jpg` | `warehouse rooftop solar aerial` |
| `area-tarim.jpg` | `agrivoltaics solar farm field` |
| `area-kamu.jpg` | `public building solar panels` (fallback: `school rooftop solar`) |
| `calc.jpg` | `family home solar panels sunset` |
| `cta.jpg` | `solar panels dusk blue hour` |

```bash
curl -s "https://unsplash.com/napi/search/photos?query=solar%20panels%20field%20sunset%20aerial&per_page=5" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); [print(r['id'], r['width'],'x',r['height'], r['urls']['raw'][:90]) for r in d['results']]"
```

If `napi` is blocked (non-JSON response), fallback: WebFetch `https://unsplash.com/s/photos/<query>` and extract photo ids, then use `https://images.unsplash.com/photo-<id>`.

- [ ] **Step 1.2: Download each pick at display resolution**

Hero at w=2400, section images at w=1600:

```bash
mkdir -p public/images/v2
curl -sL "<raw-url>&w=2400&q=80&fm=jpg&fit=max" -o public/images/v2/hero.jpg
```

- [ ] **Step 1.3: Verify every file mechanically**

```bash
cd public/images/v2 && for f in *.jpg; do file "$f" | grep -q "JPEG" || echo "BAD FORMAT: $f"; sips -g pixelWidth "$f" | tail -1; done
```
Expected: all JPEG, hero ≥2000px wide, others ≥1400px.

- [ ] **Step 1.4: Verify every file visually (Read each image)**

Check per image: subject matches target, golden-hour/dusk mood for hero+cta, no garbled AI text, no visible brand logos, composition leaves room for overlay text (hero: calm sky upper third). Replace any failure with the next candidate and re-verify.

- [ ] **Step 1.5: Write CREDITS.md + commit**

`public/images/v2/CREDITS.md`: one line per file — `hero.jpg — Unsplash photo <id> by <name> (unsplash.com/photos/<id>), Unsplash License`.

```bash
git add public/images/v2 && git commit -m "Add v2 Unsplash imagery (verified, credited)"
```

---

## Task 2: Light-first design tokens + globals

**Files:**
- Modify: `styles/tokens.css` (rewrite)
- Modify: `styles/globals.scss` (body colors, selection, focus)

- [ ] **Step 2.1: Rewrite `styles/tokens.css`**

Keep ALL existing custom-property names that components reference (`--green-*`, `--gold*`, `--paper`, `--sand*`, `--ink*`, `--on-dark*`, `--glass-*`, `--r-*`, `--space-*`, `--container*`, `--header-h`, `--lh-*`, shadows) and add the new light-first semantics — nothing may dangle:

```css
/* MİNADA v2 "Altın Saat" tokens — light-first editorial + navy/gold brand.
   Navy is ink & dark-band; gold is the light. Single source of truth. */
:root {
  /* Brand navy scale (dark surfaces, ink) */
  --green-900: #081a30;
  --green-850: #0b2140;
  --green-800: #0f2a4a;
  --green-700: #16375e;
  --green-600: #204a78;
  --green-500: #2c5c90;

  /* Gold / amber accent (logo) */
  --gold-700: #7a5210;
  --gold-600: #9c6c14; /* gold text on light (AA) */
  --gold-500: #c98a1c;
  --gold: #f2a82c;
  --gold-300: #ffc24d;

  /* Light body (v2): airy cool neutrals */
  --bg: #f5f7fb;            /* page background */
  --surface: #ffffff;       /* cards */
  --surface-2: #edf1f7;     /* alt section bg */
  --line: rgba(18, 36, 63, 0.09);
  --paper: #eef2f7;
  --sand: #e7edf5;
  --sand-50: #f5f7fb;
  --ink: #12243f;
  --ink-2: #4a5b73;

  /* Text on dark surfaces (dark band, footer, hero scrim) */
  --on-dark: #eef2f7;
  --on-dark-2: #a7b6cc;
  --on-dark-3: #7d8ea8;

  /* Glass — used ONLY on photos / dark surfaces */
  --glass-tint: rgba(10, 26, 48, 0.38);
  --glass-bg: rgba(233, 240, 250, 0.06);
  --glass-bg-2: rgba(233, 240, 250, 0.1);
  --glass-brd: rgba(233, 240, 250, 0.15);
  --glass-blur: 16px;

  /* Semantic */
  --fg: var(--ink);
  --accent: var(--gold);
  --on-accent: #14243d;

  /* Radius (v2: bigger, editorial) */
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 20px;
  --r-xl: 28px;
  --r-pill: 999px;

  /* Spacing scale (unchanged) */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem; --space-10: 2.5rem;
  --space-12: 3rem; --space-16: 4rem; --space-20: 5rem; --space-24: 6rem; --space-32: 8rem;

  /* Layout */
  --container: 1200px;
  --container-wide: 1360px;
  --header-h: 84px;

  /* Type */
  --lh-tight: 1.03;
  --lh-snug: 1.25;
  --lh-normal: 1.6;
  --fs-display: clamp(3.4rem, 11.5vw, 11.5rem); /* hero display words */
  --fs-h2: clamp(2rem, 4.2vw, 3.4rem);

  /* Effects */
  --glow-gold: 0 16px 44px -14px rgba(242, 168, 44, 0.5);
  --shadow-card: 0 24px 60px -30px rgba(0, 0, 0, 0.55);       /* on dark */
  --shadow-card-light: 0 20px 50px -28px rgba(18, 36, 63, 0.22); /* on light */
  --shadow-soft: 0 2px 10px rgba(18, 36, 63, 0.08);
}
```

- [ ] **Step 2.2: Update `styles/globals.scss` body + accents**

Replace the `body` block's colors and selection/focus so the default is light:

```scss
body {
  font-family: var(--font-body), system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--ink);
  /* rest unchanged */
}
```
`::selection` → `background: var(--gold); color: var(--on-accent);` (unchanged). `:focus-visible` outline `var(--gold-500)` so it's visible on light.

- [ ] **Step 2.3: Sweep `Section.module.scss` tones to v2 values**

```scss
.light { background: var(--bg); color: var(--ink); }
.sand  { background: var(--surface-2); color: var(--ink); }
.dark  { background: linear-gradient(180deg, var(--green-850), var(--green-800)); color: var(--on-dark); border-radius: var(--r-xl); }
/* .dark becomes an inset rounded band: */
.dark { margin-inline: clamp(8px, 1.5vw, 24px); }
.band  { /* keep gradient, add radius/margins identical to .dark */ }
```
(Full file rewritten in place; `.inner` container stays.)

- [ ] **Step 2.4: Build + eyeball every route**

Run: `npm run build` → expect SSG-green for all `/tr` + `/en` routes.
Preview `/tr`: body must be light, dark sections still legible (they carry their own colors). Inner pages (`/tr/hakkimizda` etc. PlaceholderPage) legible on light.

- [ ] **Step 2.5: Commit**

```bash
git add styles components/ui/Section.module.scss && git commit -m "v2 tokens: light-first body, bigger radii, display type scale"
```

---

## Task 3: Button system (pill + arrow-circle + glass variant)

**Files:**
- Modify: `components/ui/Button.tsx` (add `glass` variant + optional arrow)
- Modify: `components/ui/Button.module.scss` (rewrite)

- [ ] **Step 3.1: Extend Button API**

In `Button.tsx`: `type Variant = "primary" | "secondary" | "ghost" | "glass";` and add prop `withArrow?: boolean` which renders after children:

```tsx
{withArrow && (
  <span className={styles.arrow} aria-hidden="true">
    <IconArrowRight size={15} />
  </span>
)}
```
Import `IconArrowRight` from `@/components/ui/icons`.

- [ ] **Step 3.2: Rewrite `Button.module.scss`**

```scss
.btn {
  display: inline-flex; align-items: center; gap: 0.65rem;
  border-radius: var(--r-pill);
  font-weight: 650; font-family: var(--font-body), sans-serif;
  line-height: 1; letter-spacing: 0.01em;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease;
  &:hover { transform: translateY(-1px); }
  &:active { transform: translateY(0); }
}
.md { padding: 0.85rem 1.35rem; font-size: 0.95rem; }
.lg { padding: 1.05rem 1.6rem; font-size: 1.02rem; }

.arrow {
  display: inline-grid; place-items: center;
  width: 1.7em; height: 1.7em; margin-right: -0.45em;
  border-radius: 50%; background: rgba(20, 36, 61, 0.14);
}

.primary {
  background: linear-gradient(180deg, var(--gold-300), var(--gold));
  color: var(--on-accent);
  box-shadow: var(--glow-gold);
  &:hover { box-shadow: 0 20px 50px -14px rgba(242, 168, 44, 0.65); }
  .arrow { background: rgba(20, 36, 61, 0.16); }
}
.secondary {
  background: var(--ink); color: var(--on-dark);
  .arrow { background: rgba(238, 242, 247, 0.16); }
  &:hover { background: var(--green-700); }
}
.ghost {
  background: transparent; color: var(--ink);
  border: 1px solid var(--line); background: var(--surface);
  &:hover { border-color: rgba(18, 36, 63, 0.22); }
}
.glass { /* for photo/dark contexts */
  color: var(--on-dark);
  background: rgba(233, 240, 250, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px) saturate(1.4);
  -webkit-backdrop-filter: blur(10px) saturate(1.4);
  .arrow { background: rgba(255, 255, 255, 0.18); }
  &:hover { background: rgba(233, 240, 250, 0.2); }
}
```

- [ ] **Step 3.3: Build + visual check + commit**

`npm run build` green. Existing `secondary` usages (hero, FinalCta, LeadForm?) render dark-ink pill — acceptable interim; heroes get re-done later tasks.
`grep -rn "variant=\"secondary\"" components app` — confirm each site still reads OK on its background after tone flip; adjust call-sites in later tasks, not here.

```bash
git add components/ui/Button.tsx components/ui/Button.module.scss && git commit -m "v2 buttons: pill + arrow-circle, glass variant"
```

---

## Task 4: Real logo + floating glass header with scroll state

**Files:**
- Modify: `components/ui/Logo.tsx` (real `public/logo/logo.png` in a white chip)
- Modify: `components/ui/Logo.module.scss`
- Create: `components/layout/HeaderShell.tsx` (client scroll-state wrapper)
- Modify: `components/layout/Header.tsx`, `components/layout/Header.module.scss` (rewrite)
- Modify: `components/layout/MobileNav.module.scss` + `LanguageSwitcher.module.scss` (colors only)

- [ ] **Step 4.1: Logo → real asset in white chip**

```tsx
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import styles from "./Logo.module.scss";

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className={styles.logo} aria-label="MİNADA">
      <span className={styles.chip}>
        <Image src="/logo/logo.png" alt="" width={30} height={30} className={styles.img} />
      </span>
      {withWordmark && <span className={styles.word}>MİNADA</span>}
    </Link>
  );
}
```

```scss
.logo { display: inline-flex; align-items: center; gap: 0.6rem; }
.chip {
  display: grid; place-items: center; width: 42px; height: 42px;
  background: #fff; border-radius: 13px;
  box-shadow: inset 0 0 0 1px var(--line), var(--shadow-soft);
}
.img { width: 28px; height: 28px; object-fit: contain; }
.word {
  font-family: var(--font-display), sans-serif;
  font-weight: 700; font-size: 1.18rem; letter-spacing: 0.04em;
  color: currentColor;
}
```

- [ ] **Step 4.2: HeaderShell client wrapper (scroll state)**

`components/layout/HeaderShell.tsx`:

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";

export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div data-scrolled={scrolled || undefined}>{children}</div>;
}
```

- [ ] **Step 4.3: Header → floating glass pill**

`Header.tsx`: wrap current contents with `<HeaderShell>`; structure: fixed header, inner container, one pill `<div className={styles.pill}>` holding logo / nav / actions.

`Header.module.scss` core:

```scss
@use "../../styles/mixins" as *;

.header {
  position: fixed; inset-inline: 0; top: 0; z-index: 100;
  padding-top: 14px; pointer-events: none;
}
.inner { @include container(var(--container-wide)); }
.pill {
  pointer-events: auto;
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-6);
  padding: 10px 12px 10px 14px;
  border-radius: var(--r-pill);
  color: var(--on-dark);              /* over hero photo */
  background: rgba(10, 26, 48, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(14px) saturate(1.5);
  -webkit-backdrop-filter: blur(14px) saturate(1.5);
  transition: background .25s ease, color .25s ease, box-shadow .25s ease;
}
[data-scrolled] .pill {                /* over light body */
  color: var(--ink);
  background: rgba(255, 255, 255, 0.82);
  border-color: var(--line);
  box-shadow: var(--shadow-card-light);
}
.nav { display: flex; gap: clamp(0.75rem, 2vw, 1.6rem); }
.link {
  font-size: 0.95rem; font-weight: 600; opacity: 0.85; padding: 0.4rem 0.2rem;
  &:hover { opacity: 1; }
}
.actions { display: flex; align-items: center; gap: var(--space-3); }
@include bp-down(960px) { .nav, .langDesktop, .ctaDesktop { display: none; } }
```
Keep `.langDesktop`/`.ctaDesktop` spans and MobileNav exactly as-is functionally. The `.chip` white square keeps the navy logo legible over both photo and light body; wordmark inherits pill color.

- [ ] **Step 4.4: Build + screenshots (top + scrolled) + commit**

Preview `/tr`: header pill glass over hero, turns white after scrolling. Mobile 375px: pill collapses to logo + burger.

```bash
git add components/layout components/ui/Logo.* && git commit -m "v2 header: floating glass pill + scroll state; real logo"
```

---

## Task 5: Hero — "Altın Saat" showpiece

**Files:**
- Modify: `components/marketing/Hero.tsx` (rewrite)
- Modify: `components/marketing/Hero.module.scss` (rewrite)
- Modify: `messages/tr.json` + `messages/en.json` (Hero namespace additions)

- [ ] **Step 5.1: Add message keys (both locales)**

TR `Hero` additions:
```json
"display1": "GÜNEŞ",
"display2": "ENERJİSİ",
"tagline": "Enerji dönüşümü yolculuğunuzda güvenilir bir liman.",
"taglineAccent": "liman",
"chipSavingValue": "%90'a varan",
"chipSavingLabel": "fatura tasarrufu",
"chipWarrantyValue": "10 yıl",
"chipWarrantyLabel": "garanti & servis",
"calcCardTitle": "Tasarrufunu hesapla",
"calcCardDesc": "2 dakikada kaba bir tablo görün.",
"imageAlt": "Gün batımında güneş panelleri"
```
EN mirrors: `"display1": "SOLAR", "display2": "POWER"`, `"tagline": "A safe harbor for your energy transition journey."`, `"taglineAccent": "harbor"`, chips translated (`"Up to 90%" / "bill savings"`, `"10-year" / "warranty & service"`, `"Calculate your savings" / "See a rough picture in 2 minutes."`, `"imageAlt": "Solar panels at sunset"`). Keep all existing keys (subtitle etc.) — still used.

- [ ] **Step 5.2: Rewrite `Hero.tsx`**

```tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./Hero.module.scss";

function PanelGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 92" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="heroGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--gold-300)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <g transform="skewX(-13)">
        <rect x="24" y="2" width="15" height="26" rx="4" fill="url(#heroGold)" />
        <rect x="24" y="33" width="15" height="26" rx="4" fill="url(#heroGold)" />
        <rect x="24" y="64" width="15" height="26" rx="4" fill="url(#heroGold)" />
      </g>
    </svg>
  );
}

export async function Hero() {
  const t = await getTranslations("Hero");
  const tc = await getTranslations("Common");
  const tagline = t("tagline");
  const accent = t("taglineAccent");
  const [pre, post] = tagline.split(accent);

  return (
    <section className={styles.hero}>
      <Image
        src="/images/v2/hero.jpg"
        alt={t("imageAlt")}
        fill
        preload
        sizes="100vw"
        className={styles.photo}
      />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.tagline}>
          {pre}
          <em>{accent}</em>
          {post}
        </p>

        <h1 className={styles.display}>
          <span className={styles.d1}>{t("display1")}</span>
          <PanelGlyph className={styles.glyph} />
          <span className={styles.d2}>{t("display2")}</span>
        </h1>

        <div className={styles.house} aria-hidden="true">
          <Image
            src="/hero/hero-home.png"
            alt=""
            width={760}
            height={568}
            sizes="(max-width: 900px) 320px, 560px"
            className={styles.houseImg}
          />
        </div>

        <div className={styles.chipSaving}>
          <svg className={styles.ring} width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(238,242,247,0.18)" strokeWidth="3.2" />
            <circle cx="22" cy="22" r="17" fill="none" stroke="var(--gold-300)" strokeWidth="3.2"
              strokeLinecap="round" strokeDasharray="107" strokeDashoffset="11" transform="rotate(-90 22 22)" />
          </svg>
          <div>
            <strong>{t("chipSavingValue")}</strong>
            <span>{t("chipSavingLabel")}</span>
          </div>
        </div>

        <div className={styles.chipWarranty}>
          <strong>{t("chipWarrantyValue")}</strong>
          <span>{t("chipWarrantyLabel")}</span>
        </div>

        <div className={styles.bottom}>
          <p className={styles.sub}>{t("subtitle")}</p>
          <div className={styles.actions}>
            <Button href="/contact" size="lg" withArrow>{tc("getQuote")}</Button>
            <Button href="/calculator" size="lg" variant="glass">{tc("calculate")}</Button>
          </div>
        </div>

        <Link href="/calculator" className={styles.calcCard}>
          <span className={styles.calcThumb}>
            <Image src="/images/v2/calc.jpg" alt="" width={96} height={72} />
          </span>
          <span className={styles.calcText}>
            <strong>{t("calcCardTitle")}</strong>
            <span>{t("calcCardDesc")}</span>
          </span>
          <span className={styles.calcGo}><IconArrowRight size={16} /></span>
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.3: Rewrite `Hero.module.scss`**

```scss
@use "../../styles/mixins" as *;

.hero {
  position: relative;
  min-height: 95svh;
  display: flex; align-items: stretch;
  overflow: hidden;
  color: var(--on-dark);
  border-radius: 0 0 var(--r-xl) var(--r-xl);
}
.photo { object-fit: cover; object-position: center 62%; }
.scrim {
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(8, 26, 48, 0.42) 0%, rgba(8, 26, 48, 0.05) 32%, rgba(8, 26, 48, 0.12) 58%, rgba(8, 26, 48, 0.78) 100%);
}
.inner {
  @include container(var(--container-wide));
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  padding-top: calc(var(--header-h) + var(--space-10));
  padding-bottom: var(--space-10);
}
.tagline {
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  opacity: 0.92; margin-bottom: var(--space-4);
  em { font-family: var(--font-serif), serif; font-style: italic; color: var(--gold-300); }
}
.display {
  position: relative; z-index: 3;
  font-size: var(--fs-display);
  line-height: 0.92; letter-spacing: -0.03em; font-weight: 700;
  color: #fff;
  text-shadow: 0 4px 44px rgba(8, 26, 48, 0.45);
  display: flex; flex-direction: column;
}
.d1 { align-self: flex-start; }
.d2 { align-self: flex-end; margin-top: -0.06em; }
.glyph {
  position: absolute; left: 50%; top: 50%;
  height: 0.85em; width: auto;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 10px 30px rgba(242, 168, 44, 0.45));
}
.house {
  position: absolute; left: 50%; bottom: 8%;
  transform: translateX(-50%);
  width: clamp(300px, 42vw, 560px);
  z-index: 4;
  filter: drop-shadow(0 40px 60px rgba(8, 26, 48, 0.55));
}
.houseImg { width: 100%; height: auto; }

%chip {
  @include glass;
  position: absolute; z-index: 5;
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--r-lg);
  strong { display: block; font-family: var(--font-display), sans-serif; font-size: 1.25rem; }
  span { display: block; font-size: 0.82rem; color: var(--on-dark-2); }
}
.chipSaving { @extend %chip; left: 4%; top: 56%; }
.chipWarranty { @extend %chip; right: 5%; top: 40%; flex-direction: column; align-items: flex-start; gap: 2px; }
.ring { flex: none; }

.bottom {
  margin-top: auto;
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-8);
  position: relative; z-index: 6;
}
.sub { max-width: 44ch; font-size: 1.05rem; color: var(--on-dark-2); }
.actions { display: flex; gap: var(--space-3); flex: none; }

.calcCard {
  @include glass;
  position: absolute; right: max(24px, 3%); bottom: var(--space-10); z-index: 7;
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-2); padding-right: var(--space-4);
  border-radius: var(--r-lg);
  transition: transform .2s ease;
  &:hover { transform: translateY(-2px); }
}
.calcThumb img { border-radius: calc(var(--r-lg) - 6px); object-fit: cover; }
.calcText { strong { display: block; font-size: 0.95rem; } span { font-size: 0.8rem; color: var(--on-dark-2); } }
.calcGo {
  display: grid; place-items: center; width: 34px; height: 34px;
  border-radius: 50%; background: var(--gold); color: var(--on-accent);
}

@include bp-down(1080px) {
  .chipWarranty { display: none; }
  .calcCard { display: none; }
}
@include bp-down(760px) {
  .hero { min-height: 88svh; }
  .chipSaving { position: static; align-self: flex-start; margin-top: var(--space-6); }
  .house { width: min(74vw, 360px); bottom: 20%; }
  .bottom { flex-direction: column; align-items: flex-start; gap: var(--space-5); }
  .actions { flex-wrap: wrap; }
}
```

Note: `.bottom` uses `margin-top: auto` — the flex column pins CTAs to the hero's lower edge; the display block sits above the house layer (z 3 < 4), chips above both.

- [ ] **Step 5.4: Build, screenshot desktop+mobile, iterate**

`npm run build` green → preview `/tr` and `/en`.
Acceptance vs refs: display words dominate (~viewport-wide), glyph reads as gold panel stroke between words, house cutout overlaps type from below, chips glassy on photo, header pill floats above, scrim keeps AA for tagline/sub. Iterate spacing/sizes by screenshot until it matches the SunVault/Creaenergy energy.
**Checkpoint:** show user screenshot; decide keep-house vs photo-only (spec allows both; if photo-only, delete `.house` block + component usage).

- [ ] **Step 5.5: Commit**

```bash
git add components/marketing/Hero.* messages && git commit -m "v2 hero: cinematic photo + display type + glass chips"
```

---

## Task 6: Intro section (new)

**Files:**
- Create: `components/marketing/Intro.tsx`, `components/marketing/Intro.module.scss`
- Modify: `app/[locale]/(marketing)/page.tsx` (insert `<Intro />` after `<Hero />`)
- Modify: `messages/tr.json` + `en.json` (new `Home.intro` namespace)

- [ ] **Step 6.1: Messages**

TR:
```json
"intro": {
  "eyebrow": "MİNADA kimdir",
  "lead": "Konutlardan işletmelere,",
  "boldPart": "güneşten batarya depolamaya",
  "rest": "— enerji dönüşümünüzü tek çatı altında tasarlar, kurar ve işletiriz.",
  "muted": "Keşiften devreye alışa kadar tüm süreç bizde; siz sadece güneşin tadını çıkarın.",
  "point1": "Anahtar teslim kurulum",
  "point2": "10 yıl garanti & servis",
  "chipValue": "500+",
  "chipLabel": "kurulu kWp"
}
```
EN mirror with same keys. (Values: "Who is MİNADA" / "From homes to businesses," / "from solar to battery storage" / "— we design, build and operate your energy transition under one roof." / "From survey to commissioning, the whole process is on us; you just enjoy the sun." / "Turnkey installation" / "10-year warranty & service" / "500+" / "installed kWp".)

- [ ] **Step 6.2: Component**

```tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { IconCheck } from "@/components/ui/icons";
import styles from "./Intro.module.scss";

export async function Intro() {
  const t = await getTranslations("Home.intro");

  return (
    <Section tone="light">
      <div className={styles.grid}>
        <div className={styles.photos}>
          <Image src="/images/v2/area-konut.jpg" alt="" width={420} height={300} className={styles.ph1} />
          <Image src="/images/v2/service-solar.jpg" alt="" width={420} height={300} className={styles.ph2} />
          <div className={styles.chip}>
            <strong>{t("chipValue")}</strong>
            <span>{t("chipLabel")}</span>
          </div>
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <p className={styles.lead}>
            {t("lead")} <em>{t("boldPart")}</em> {t("rest")}
            <span className={styles.muted}> {t("muted")}</span>
          </p>
          <ul className={styles.points}>
            <li><IconCheck size={16} /> {t("point1")}</li>
            <li><IconCheck size={16} /> {t("point2")}</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
```

```scss
@use "../../styles/mixins" as *;

.grid {
  display: grid; grid-template-columns: 0.9fr 1.1fr;
  gap: clamp(var(--space-8), 5vw, var(--space-16));
  align-items: center;
  @include bp-down(900px) { grid-template-columns: 1fr; }
}
.photos { position: relative; display: grid; gap: var(--space-4); grid-template-columns: 1fr 1fr; }
.ph1, .ph2 { width: 100%; height: auto; border-radius: var(--r-lg); box-shadow: var(--shadow-card-light); }
.ph2 { margin-top: var(--space-8); }
.chip {
  position: absolute; left: 50%; bottom: -14px; transform: translateX(-50%);
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-pill);
  padding: 0.5rem 1.1rem; display: flex; gap: 0.5rem; align-items: baseline;
  box-shadow: var(--shadow-card-light);
  strong { font-family: var(--font-display), sans-serif; color: var(--gold-600); }
  span { font-size: 0.85rem; color: var(--ink-2); }
}
.eyebrow {
  color: var(--gold-600); font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; font-size: 0.8rem; margin-bottom: var(--space-4);
}
.lead {
  font-family: var(--font-display), sans-serif;
  font-size: clamp(1.5rem, 2.6vw, 2.2rem); line-height: 1.32; font-weight: 600;
  color: var(--ink); letter-spacing: -0.01em;
  em { font-family: var(--font-serif), serif; font-style: italic; color: var(--gold-600); font-weight: 500; }
}
.muted { color: var(--ink-2); font-weight: 500; }
.points {
  @include list-reset; display: flex; gap: var(--space-6); margin-top: var(--space-6);
  li { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--ink);
       svg { color: var(--gold-600); } }
  @include bp-down(560px) { flex-direction: column; gap: var(--space-3); }
}
```

- [ ] **Step 6.3: Insert into homepage, build, screenshot, commit**

In `page.tsx`: import + `<Intro />` between `<Hero />` and `<Services />`.

```bash
git add components/marketing/Intro.* app messages && git commit -m "v2 intro: mixed-emphasis editorial section"
```

---

## Task 7: Services — the dark band with photo cards

**Files:**
- Modify: `components/marketing/Services.tsx`, `Services.module.scss` (rewrite)
- Modify: `messages/tr.json` + `en.json` (no new keys needed — reuse `Home.services.*`, `Services.*`)

- [ ] **Step 7.1: Markup — photo cards**

Map service id → image: `solar→/images/v2/service-solar.jpg`, `storage→service-battery.jpg`, `ev→service-ev.jpg`, `heatpump→service-heatpump.jpg` (const `IMG: Record<id,string>` in the component). Change `<Section tone="light">` → `tone="dark"`, `SectionHeading tone="dark"`. Card:

```tsx
<Link key={id} href="/services" className={styles.card}>
  <span className={styles.media}>
    <Image src={IMG[id]} alt="" width={560} height={400} sizes="(max-width: 760px) 80vw, 24vw" />
    <span className={styles.iconChip}><Icon size={20} /></span>
  </span>
  <h3 className={styles.cardTitle}>{ts(id)}</h3>
  <p className={styles.cardDesc}>{t(`${id}.desc`)}</p>
  <span className={styles.more}>{t("cta")} <IconArrowRight size={15} /></span>
</Link>
```

- [ ] **Step 7.2: SCSS**

```scss
@use "../../styles/mixins" as *;

.grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5);
  @include bp-down(1080px) { grid-template-columns: repeat(2, 1fr); }
  @include bp-down(640px) {
    display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
    margin-inline: calc(-1 * var(--space-4)); padding-inline: var(--space-4);
    > * { flex: 0 0 78vw; scroll-snap-align: start; }
  }
}
.card {
  display: flex; flex-direction: column; gap: var(--space-2);
  background: rgba(238, 242, 247, 0.05);
  border: 1px solid rgba(238, 242, 247, 0.1);
  border-radius: var(--r-xl); padding: var(--space-3);
  transition: transform .2s ease, border-color .2s ease;
  &:hover { transform: translateY(-4px); border-color: rgba(242, 168, 44, 0.45);
            .more svg { transform: translateX(3px); } }
}
.media {
  position: relative; border-radius: calc(var(--r-xl) - 8px); overflow: hidden;
  img { width: 100%; height: 200px; object-fit: cover; }
}
.iconChip {
  @include glass;
  position: absolute; top: 10px; left: 10px;
  display: grid; place-items: center; width: 40px; height: 40px;
  border-radius: 12px; color: var(--gold-300);
}
.cardTitle { font-size: 1.15rem; margin-top: var(--space-2); padding-inline: var(--space-2); }
.cardDesc { font-size: 0.92rem; color: var(--on-dark-2); padding-inline: var(--space-2); flex: 1; }
.more {
  display: inline-flex; align-items: center; gap: 0.4rem;
  color: var(--gold-300); font-weight: 650; font-size: 0.9rem;
  padding: var(--space-2); svg { transition: transform .2s ease; }
}
```

- [ ] **Step 7.3: Build, screenshot (desktop + 375px horizontal scroll), commit**

```bash
git add components/marketing/Services.* && git commit -m "v2 services: dark band, photo cards"
```

---

## Task 8: HowItWorks — light steps with gold connector

**Files:**
- Modify: `components/marketing/HowItWorks.tsx` (tone dark→light), `HowItWorks.module.scss` (rewrite)

- [ ] **Step 8.1:** `<Section tone="light" …>`, `SectionHeading` default tone. Markup unchanged otherwise.

- [ ] **Step 8.2: SCSS**

```scss
@use "../../styles/mixins" as *;

.grid {
  @include list-reset; counter-reset: step;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5);
  position: relative;
  @include bp-down(1000px) { grid-template-columns: repeat(2, 1fr); }
  @include bp-down(560px) { grid-template-columns: 1fr; }
}
.step {
  position: relative; background: var(--surface);
  border: 1px solid var(--line); border-radius: var(--r-xl);
  padding: var(--space-6); box-shadow: var(--shadow-soft);
  &:not(:last-child)::after {           /* gold connector, desktop only */
    content: ""; position: absolute; top: 38px; right: -26px;
    width: 28px; height: 2px;
    background: linear-gradient(90deg, var(--gold), transparent);
    @include bp-down(1000px) { display: none; }
  }
}
.num {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: 0.95rem; color: var(--gold-600);
  display: inline-grid; place-items: center; width: 40px; height: 40px;
  border-radius: 50%; background: rgba(242, 168, 44, 0.12);
  margin-bottom: var(--space-4);
}
.icon { color: var(--green-600); margin-bottom: var(--space-3); display: block; }
.stepTitle { font-size: 1.1rem; margin-bottom: var(--space-2); }
.stepDesc { font-size: 0.93rem; color: var(--ink-2); }
```

- [ ] **Step 8.3: Build, screenshot, commit** — `git commit -m "v2 how-it-works: light step cards"`

---

## Task 9: ApplicationAreas — photo tiles with glass labels

**Files:**
- Modify: `components/marketing/ApplicationAreas.tsx`, `.module.scss` (rewrite)

- [ ] **Step 9.1: Markup** — add per-area image map (`konut→area-konut.jpg`, `ticari→area-ticari.jpg`, `tarim→area-tarim.jpg`, `kamu→area-kamu.jpg`); keep `<Section tone="sand">`:

```tsx
<div key={id} className={styles.tile}>
  <Image src={IMG[id]} alt="" fill sizes="(max-width: 900px) 46vw, 23vw" className={styles.img} />
  <div className={styles.label}>
    <span className={styles.labelIcon}><Icon size={18} /></span>
    <div>
      <h3 className={styles.title}>{t(`${id}.title`)}</h3>
      <p className={styles.desc}>{t(`${id}.desc`)}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 9.2: SCSS** — tiles 3:4, glass label bottom:

```scss
@use "../../styles/mixins" as *;

.grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4);
  @include bp-down(900px) { grid-template-columns: repeat(2, 1fr); }
}
.tile {
  position: relative; aspect-ratio: 3 / 4;
  border-radius: var(--r-xl); overflow: hidden;
  box-shadow: var(--shadow-card-light);
  &::after { content: ""; position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 45%, rgba(8, 26, 48, 0.62)); }
}
.img { object-fit: cover; transition: transform .5s ease; }
.tile:hover .img { transform: scale(1.04); }
.label {
  @include glass;
  position: absolute; z-index: 2; inset-inline: 10px; bottom: 10px;
  display: flex; gap: var(--space-3); align-items: flex-start;
  padding: var(--space-3); border-radius: var(--r-lg);
  color: var(--on-dark);
}
.labelIcon { color: var(--gold-300); flex: none; margin-top: 2px; }
.title { font-size: 1rem; }
.desc { font-size: 0.8rem; color: var(--on-dark-2);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
```

- [ ] **Step 9.3: Build, screenshot, commit** — `git commit -m "v2 application areas: photo tiles + glass labels"`

---

## Task 10: CalculatorTeaser — split with glass gauge photo card

**Files:**
- Modify: `components/marketing/CalculatorTeaser.tsx`, `.module.scss` (rewrite)
- Modify: `messages/*` — add `Home.calc.point1/point2/point3`, `Home.calc.badgeValue/badgeLabel`

- [ ] **Step 10.1: Messages** — TR: `"point1": "Fatura ve şehir bilgisiyle 2 dakikada sonuç"`, `"point2": "kWp, maliyet aralığı ve geri ödeme süresi"`, `"point3": "25 yıllık tasarruf ve CO₂ etkisi"`, `"badgeValue": "%90"`, `"badgeLabel": "fatura tasarrufuna kadar"`; EN mirrors.

- [ ] **Step 10.2: Markup** — `<Section tone="light">`, two-col: copy (eyebrow, title, desc, ✓ points, gold CTA `withArrow`, note) + photo card:

```tsx
<div className={styles.media}>
  <Image src="/images/v2/calc.jpg" alt="" width={720} height={560} sizes="(max-width: 900px) 92vw, 46vw" className={styles.img} />
  <div className={styles.badge}>
    <svg className={styles.gauge} width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
      <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(238,242,247,0.18)" strokeWidth="4" />
      <circle cx="26" cy="26" r="20" fill="none" stroke="var(--gold-300)" strokeWidth="4"
        strokeLinecap="round" strokeDasharray="126" strokeDashoffset="13" transform="rotate(-90 26 26)" />
    </svg>
    <div><strong>{t("badgeValue")}</strong><span>{t("badgeLabel")}</span></div>
  </div>
</div>
```

- [ ] **Step 10.3: SCSS** — grid 1.05fr/0.95fr (stacks <900px); `.img` full-width `border-radius: var(--r-xl)`; `.badge { @include glass; position: absolute; left: 18px; bottom: 18px; border-radius: var(--r-lg); display: flex; gap: var(--space-3); padding: var(--space-3) var(--space-5); color: var(--on-dark); strong { font-family: var(--font-display); font-size: 1.35rem; display: block; } span { font-size: 0.8rem; color: var(--on-dark-2); } }`; points list = IconCheck gold rows.

- [ ] **Step 10.4: Build, screenshot, commit** — `git commit -m "v2 calculator teaser: split + glass gauge card"`

---

## Task 11: Testimonials + FAQ — light polish

**Files:**
- Modify: `Testimonials.module.scss`, `FaqTeaser.module.scss` (rewrites; TSX untouched)

- [ ] **Step 11.1: Testimonials SCSS** — white cards `var(--r-xl)`, `var(--shadow-soft)`, `border: 1px solid var(--line)`, gold stars (`.stars { color: var(--gold); }`), quote `font-size: 1.02rem; color: var(--ink)`, name bold ink, meta `var(--ink-2)`; grid 3→1 col responsive.

- [ ] **Step 11.2: FaqTeaser SCSS** — `Section` stays sand; items = white rounded `var(--r-lg)` rows, `summary` bold ink with gold plus/minus marker (`details[open] summary::after` rotate), answer `var(--ink-2)`; `.more` gold-600 link.

- [ ] **Step 11.3: Build, screenshot, commit** — `git commit -m "v2 testimonials + faq: light cards"`

---

## Task 12: FinalCta — photo band with center glass card

**Files:**
- Modify: `components/marketing/FinalCta.tsx`, `.module.scss` (rewrite)

- [ ] **Step 12.1: Markup** — drop `Section`, custom full-bleed band:

```tsx
<section className={styles.cta}>
  <Image src="/images/v2/cta.jpg" alt="" fill sizes="100vw" className={styles.photo} />
  <div className={styles.scrim} aria-hidden="true" />
  <div className={styles.card}>
    <p className={styles.eyebrow}>{t("eyebrow")}</p>
    <h2 className={styles.title}>{t("title")}</h2>
    <p className={styles.desc}>{t("desc")}</p>
    <div className={styles.actions}>
      <Button href="/contact" size="lg" withArrow>{tc("getQuote")}</Button>
      <Button externalHref={whatsappLink(t("waMessage"))} variant="glass" size="lg">{tc("whatsapp")}</Button>
    </div>
  </div>
</section>
```

- [ ] **Step 12.2: SCSS** — `.cta { position: relative; padding-block: clamp(72px, 10vw, 140px); display: grid; place-items: center; overflow: hidden; border-radius: var(--r-xl); margin: clamp(8px, 1.5vw, 24px); }`; `.photo { object-fit: cover; }`; `.scrim` navy radial+linear (center darker ~0.55); `.card { @include glass; max-width: 640px; text-align: center; padding: clamp(var(--space-8), 5vw, var(--space-12)); border-radius: var(--r-xl); color: var(--on-dark); margin-inline: var(--space-4); }`; title `clamp(1.8rem, 3.6vw, 2.8rem)`; eyebrow gold-300 uppercase; actions centered wrap.

- [ ] **Step 12.3: Build, screenshot, commit** — `git commit -m "v2 final cta: photo band + glass card"`

---

## Task 13: Footer — navy with ghost wordmark

**Files:**
- Modify: `components/layout/Footer.tsx` (add ghost word div), `Footer.module.scss` (rewrite)

- [ ] **Step 13.1:** Add inside `<footer>` before `.inner`: `<div className={styles.ghost} aria-hidden="true">MİNADA</div>`.

- [ ] **Step 13.2: SCSS core**

```scss
.footer {
  position: relative; overflow: hidden;
  background: linear-gradient(180deg, var(--green-850), var(--green-900));
  color: var(--on-dark);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  margin-top: var(--space-6);
}
.ghost {
  position: absolute; inset-inline: 0; bottom: -0.22em;
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(6rem, 17vw, 16rem); line-height: 1; text-align: center;
  color: rgba(238, 242, 247, 0.045); pointer-events: none; user-select: none;
  letter-spacing: 0.02em;
}
```
Columns/links: keep current class structure; colTitle small-caps gold-300, links `--on-dark-2` hover white; `.bottom` border-top `rgba(238,242,247,0.1)`; generous `padding-block: var(--space-16) var(--space-20)` so the ghost has room.

- [ ] **Step 13.3: Build, screenshot, commit** — `git commit -m "v2 footer: navy + ghost wordmark"`

---

## Task 14: Full-page pass — QA + fixups

**Files:** anything surfaced.

- [ ] **Step 14.1:** `npm run build` (SSG-green TR+EN, no route regressions) and `npx eslint .` clean.
- [ ] **Step 14.2:** Preview full-page screenshots: `/tr` + `/en`, desktop 1280 + mobile 375, top-to-bottom scroll captures. Check: section rhythm (light/sand/dark alternation per spec order incl. `<Intro />`), header scroll transition on light body, EN display words fit (`SOLAR/POWER` shorter than TR — verify glyph centering), reduced-motion (no transform transitions when emulated), keyboard focus visible on gold.
- [ ] **Step 14.3:** Inner-page sanity: `/tr/hesaplayici` (Calculator on light bg), `/tr/iletisim` (LeadForm inputs legible), one PlaceholderPage. Fix any dark-assuming SCSS in `Calculator.module.scss` / `LeadForm.module.scss` / `PlaceholderPage.module.scss` / `PortableBody.module.scss` with the same light-card recipe as Task 11 (white surface, `--line` border, ink text) — markup untouched.
- [ ] **Step 14.4:** Show the user final screenshots for approval; iterate visuals as requested.
- [ ] **Step 14.5:** Final commit `git commit -m "v2 QA pass: inner-page fixups"` + update memory note (design direction v2). Remind user: repo may be behind origin (Vercel-fix commit) — `git pull` before push.

---

## Self-review notes

- Spec coverage: hero (T5), header (T4), intro (T6), services dark band (T7), how-it-works (T8), areas (T9), calc teaser (T10), testimonials+faq (T11), final CTA (T12), footer (T13), tokens/system (T2-3), imagery (T1), perf/a11y (preload/fetchPriority in T5, reduced-motion + focus checks in T14), bilingual (every message step edits both files). Hero house-vs-photo decision = explicit checkpoint T5.4.
- No unit tests by design (no infra; verification = build + lint + screenshot acceptance per task).
- Type consistency: `Variant` union extended once (T3) and used by T5/T12 (`variant="glass"`); `withArrow` defined T3, used T5/T10/T12; image paths defined T1 and consumed T5-T12 with exact filenames.
