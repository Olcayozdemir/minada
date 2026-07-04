# Enerji Hattı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home page boyunca inen, scroll ile gold→cyan boyanan, ucunda spark taşıyan tek bir devre-hattı SVG overlay'i (EnergyLine).

**Architecture:** Tek client komponenti home section'larını sarar; DOM'dan section rect'lerini ölçüp köşeleri yuvarlatılmış tek bir SVG path'i otomatik üretir (sol↔sağ dönüşümlü, joglar section aralarındaki boş seam'lerde). Boyama `stroke-dashoffset` ile; progress y-eşlemeli lookup üzerinden okuma hizasını takip eder. Saf geometri ayrı bir modülde (`energyPath.ts`).

**Tech Stack:** Next.js 16 App Router (RSC + client component), SCSS Modules, el yazımı rAF/scroll pattern'i (repo'daki `HowScrollFx`/`SinkOnScroll` ile aynı aile). Kütüphane eklenmez.

**Spec:** `docs/superpowers/specs/2026-07-04-enerji-hatti-design.md`

**Test notu:** Projede test altyapısı yok (package.json'da test script'i yok; bilinçli — marketing sitesi) ve efekt tamamen görsel/dekoratif. Bu yüzden TDD yerine her task'ta `npx tsc --noEmit` + lint, sonda preview üzerinden spec'in "Doğrulama" checklist'i uygulanır. Spec bu doğrulama yaklaşımını kullanıcı onayıyla sabitledi.

**Önemli tasarım gerçeği (özel durum YOK):** Hat her section boyunca zaten dikey iner; yatay joglar yalnızca section aralarındaki seam'lerde. HowItWorks'ün pinned bölgesi bu yüzden kendiliğinden düz dikey kalır — pin için ayrı kod yazma, yazılmışsa sil.

---

### Task 1: `--volt` token'ları

**Files:**
- Modify: `styles/tokens.css` (gold bloğunun hemen altına)

- [ ] **Step 1: Token'ları ekle**

`styles/tokens.css` içinde `--gold-300: #ffc24d;` satırından sonraki boş satıra şunu ekle:

```css
  /* Electric accent — used ONLY by the home energy line (2026-07-04 spec) */
  --volt: #29d6ff;
  --volt-soft: rgba(41, 214, 255, 0.16);
```

- [ ] **Step 2: Doğrula**

Run: `grep -n "volt" styles/tokens.css`
Expected: iki satır (`--volt`, `--volt-soft`).

- [ ] **Step 3: Commit**

```bash
git add styles/tokens.css
git commit -m "tokens: --volt electric accent for the home energy line"
```

---

### Task 2: Saf geometri modülü `energyPath.ts`

**Files:**
- Create: `components/marketing/energyPath.ts`

DOM'suz saf fonksiyonlar: section kutularından rota waypoint'leri, orthogonal polyline → yuvarlatılmış SVG path, node köşeleri.

- [ ] **Step 1: Dosyayı oluştur**

```ts
// Pure geometry for the home "energy line": route waypoints from measured
// section boxes, and an orthogonal polyline → rounded SVG path string.

export type Box = { top: number; bottom: number; left: number; right: number };
export type Pt = { x: number; y: number };

const JOG_DROP = 52; // jog runs this far into a section's top padding
const START_RISE = 48; // line is born this far above the hero's bottom edge
const END_RISE = 40; // …and ends this far above the last section's bottom

/** Horizontal inset from a section's edge to the line. Tracks the container
 * gutter so the line rides the empty margin at any viewport width. */
export function sideInset(vw: number, contentMax = 1360): number {
  return Math.max(14, Math.min(36, (vw - contentMax) / 2 - 8));
}

/** Desktop circuit route: born under the hero's center, then a vertical run
 * beside each section — alternating left/right — jogging across inside the
 * empty seam at each section's top padding. Verticals within a section mean
 * the pinned HowItWorks stretch stays jog-free by construction. */
export function buildRoute(sections: Box[], vw: number): Pt[] {
  if (sections.length < 2) return [];
  const inset = sideInset(vw);
  const [hero, ...rest] = sections;
  const pts: Pt[] = [{ x: (hero.left + hero.right) / 2, y: hero.bottom - START_RISE }];
  rest.forEach((s, i) => {
    const x = i % 2 === 0 ? s.left + inset : s.right - inset;
    const jogY = s.top + JOG_DROP;
    pts.push({ x: pts[pts.length - 1].x, y: jogY }, { x, y: jogY });
  });
  const last = rest[rest.length - 1];
  pts.push({ x: pts[pts.length - 1].x, y: last.bottom - END_RISE });
  return dedupe(pts);
}

/** Mobile route: one straight run near the left edge. */
export function buildMobileRoute(sections: Box[]): Pt[] {
  if (sections.length < 2) return [];
  const hero = sections[0];
  const last = sections[sections.length - 1];
  return [
    { x: 16, y: hero.bottom - START_RISE },
    { x: 16, y: last.bottom - END_RISE },
  ];
}

/** Circuit nodes sit on every corner plus the line's endpoint. */
export function cornerPoints(pts: Pt[]): Pt[] {
  if (pts.length < 2) return [];
  return [...pts.slice(1, -1), pts[pts.length - 1]];
}

/** Orthogonal polyline → SVG path, corners rounded with quadratic curves. */
export function toRoundedPath(pts: Pt[], r = 24): string {
  if (pts.length < 2) return "";
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const n = pts[i + 1];
    const rr = Math.min(r, dist(p, c) / 2, dist(c, n) / 2);
    const a = toward(c, p, rr);
    const b = toward(c, n, rr);
    d += ` L ${f(a.x)} ${f(a.y)} Q ${f(c.x)} ${f(c.y)} ${f(b.x)} ${f(b.y)}`;
  }
  const e = pts[pts.length - 1];
  return `${d} L ${f(e.x)} ${f(e.y)}`;
}

function dedupe(pts: Pt[]): Pt[] {
  return pts.filter(
    (p, i) => i === 0 || Math.abs(p.x - pts[i - 1].x) > 0.5 || Math.abs(p.y - pts[i - 1].y) > 0.5
  );
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Point `d` px away from `from`, toward `to`. */
function toward(from: Pt, to: Pt, d: number): Pt {
  const len = dist(from, to) || 1;
  return { x: from.x + ((to.x - from.x) / len) * d, y: from.y + ((to.y - from.y) / len) * d };
}
```

- [ ] **Step 2: Tip kontrolü**

Run: `npx tsc --noEmit`
Expected: hatasız çıkış (mevcut hatalar varsa yalnızca yenisi eklenmediğini doğrula).

- [ ] **Step 3: Commit**

```bash
git add components/marketing/energyPath.ts
git commit -m "home: energy line route geometry (pure helpers)"
```

---

### Task 3: `EnergyLine` komponenti (SCSS + TSX)

**Files:**
- Create: `components/marketing/EnergyLine.module.scss`
- Create: `components/marketing/EnergyLine.tsx`

- [ ] **Step 1: SCSS modülünü yaz**

`components/marketing/EnergyLine.module.scss`:

```scss
.wrap {
  position: relative;
}

/* Decorative overlay: above section backgrounds & content, below the header
   (z:200). Never intercepts input. */
.overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  z-index: 5;
}

.track {
  fill: none;
  stroke: var(--volt-soft);
  stroke-width: 2;
}

/* Wide, faint understroke = the glow. No SVG filters (known renderer gotcha). */
.glow {
  fill: none;
  stroke-width: 7;
  stroke-linecap: round;
  opacity: 0.22;
}

.paint {
  fill: none;
  stroke-width: 2.25;
  stroke-linecap: round;
}

/* Gradient stops — sunlight up top, electricity below. */
.gGold,
.gGoldEnd {
  stop-color: var(--gold);
}

.gVolt {
  stop-color: var(--volt);
}

.gHalo0 {
  stop-color: var(--volt);
  stop-opacity: 0.5;
}

.gHalo1 {
  stop-color: var(--volt);
  stop-opacity: 0;
}

.node {
  fill: var(--volt-soft);
  transition: fill 0.35s ease;

  &[data-on] {
    fill: url(#energy-grad);
  }
}

.spark {
  opacity: 0;
  transition: opacity 0.25s ease;

  &[data-on] {
    opacity: 1;
  }
}

.core {
  fill: url(#energy-grad);
}

@media (prefers-reduced-motion: reduce) {
  .spark {
    display: none;
  }
}
```

- [ ] **Step 2: Komponenti yaz**

`components/marketing/EnergyLine.tsx`:

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./EnergyLine.module.scss";
import { buildMobileRoute, buildRoute, cornerPoints, toRoundedPath } from "./energyPath";

const READ_LINE = 0.55; // paint head tracks this fraction of the viewport
const MOBILE_MAX = 1023;
const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * "Energy line" — a single circuit-style line that weaves down the home page
 * and is painted (gold up top, cyan below) as the reader scrolls, a glowing
 * spark riding the paint head. Purely decorative: measured and drawn on the
 * client, absent without JS, static & fully painted under reduced motion.
 */
export function EnergyLine({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const paintRef = useRef<SVGPathElement>(null);
  const nodesRef = useRef<SVGGElement>(null);
  const sparkRef = useRef<SVGGElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const track = trackRef.current;
    const glow = glowRef.current;
    const paint = paintRef.current;
    const nodes = nodesRef.current;
    const spark = sparkRef.current;
    const grad = gradRef.current;
    if (!wrap || !svg || !track || !glow || !paint || !nodes || !spark || !grad) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let total = 0;
    let samples: { len: number; y: number }[] = [];
    let nodeEls: { el: SVGCircleElement; len: number }[] = [];
    let raf = 0;

    // Painted length whose endpoint sits at overlay-space y. The route only
    // ever travels down, so sampled y is monotonic → binary search.
    const lenAtY = (y: number) => {
      if (!samples.length || y <= samples[0].y) return 0;
      if (y >= samples[samples.length - 1].y) return total;
      let lo = 0;
      let hi = samples.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].y < y) lo = mid + 1;
        else hi = mid;
      }
      return samples[lo].len;
    };

    const build = () => {
      const wrapRect = wrap.getBoundingClientRect();
      const w = Math.round(wrapRect.width);
      const h = Math.round(wrapRect.height);
      const boxes = Array.from(wrap.querySelectorAll(":scope > section")).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top - wrapRect.top,
          bottom: r.bottom - wrapRect.top,
          left: r.left - wrapRect.left,
          right: r.right - wrapRect.left,
        };
      });
      const mobile = window.innerWidth <= MOBILE_MAX;
      const pts = mobile ? buildMobileRoute(boxes) : buildRoute(boxes, window.innerWidth);
      const d = toRoundedPath(pts);

      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      track.setAttribute("d", d);
      glow.setAttribute("d", d);
      paint.setAttribute("d", d);
      total = d ? paint.getTotalLength() : 0;

      samples = [];
      if (total) {
        const step = Math.max(6, total / 600);
        for (let l = 0; l < total; l += step) {
          samples.push({ len: l, y: paint.getPointAtLength(l).y });
        }
        samples.push({ len: total, y: paint.getPointAtLength(total).y });
      }

      // Gold holds through the hero, then hands off to cyan just below it.
      const heroEnd = h ? (boxes[0]?.bottom ?? h * 0.2) / h : 0.2;
      grad.setAttribute("y2", `${h}`);
      const stops = grad.children;
      (stops[1] as SVGStopElement | undefined)?.setAttribute("offset", heroEnd.toFixed(3));
      (stops[2] as SVGStopElement | undefined)?.setAttribute(
        "offset",
        Math.min(1, heroEnd + 0.08).toFixed(3)
      );

      nodes.replaceChildren();
      nodeEls = [];
      if (!mobile) {
        for (const c of cornerPoints(pts)) {
          const el = document.createElementNS(SVG_NS, "circle");
          el.setAttribute("cx", c.x.toFixed(1));
          el.setAttribute("cy", c.y.toFixed(1));
          el.setAttribute("r", "3");
          el.setAttribute("class", styles.node);
          nodes.appendChild(el);
          nodeEls.push({ el, len: lenAtY(c.y - 0.5) });
        }
      }

      paint.style.strokeDasharray = `${total}`;
      glow.style.strokeDasharray = `${total}`;
      if (reduced) {
        paint.style.strokeDashoffset = "0";
        glow.style.strokeDashoffset = "0";
        for (const n of nodeEls) n.el.toggleAttribute("data-on", true);
      }
    };

    const update = () => {
      if (!total || reduced) return;
      const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
      const targetY = window.scrollY + window.innerHeight * READ_LINE - wrapTop;
      const len = lenAtY(targetY);
      const off = total - len;
      paint.style.strokeDashoffset = `${off}`;
      glow.style.strokeDashoffset = `${off}`;

      spark.toggleAttribute("data-on", len > 1 && len < total - 1);
      if (len > 0) {
        const pt = paint.getPointAtLength(len);
        for (const c of Array.from(spark.children) as SVGCircleElement[]) {
          c.setAttribute("cx", pt.x.toFixed(1));
          c.setAttribute("cy", pt.y.toFixed(1));
        }
      }
      for (const n of nodeEls) n.el.toggleAttribute("data-on", len >= n.len);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const rebuild = () => {
      build();
      update();
    };

    build();
    update();
    const ro = new ResizeObserver(rebuild);
    ro.observe(wrap);
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", rebuild);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", rebuild);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      {children}
      <svg ref={svgRef} className={styles.overlay} aria-hidden="true">
        <defs>
          <linearGradient
            ref={gradRef}
            id="energy-grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2="1000"
          >
            <stop offset="0" className={styles.gGold} />
            <stop offset="0.2" className={styles.gGoldEnd} />
            <stop offset="0.28" className={styles.gVolt} />
          </linearGradient>
          <radialGradient id="energy-halo">
            <stop offset="0" className={styles.gHalo0} />
            <stop offset="1" className={styles.gHalo1} />
          </radialGradient>
        </defs>
        <path ref={trackRef} className={styles.track} />
        <path ref={glowRef} className={styles.glow} stroke="url(#energy-grad)" />
        <path ref={paintRef} className={styles.paint} stroke="url(#energy-grad)" />
        <g ref={nodesRef} />
        <g ref={sparkRef} className={styles.spark}>
          <circle r="16" fill="url(#energy-halo)" />
          <circle className={styles.core} r="3.2" />
        </g>
      </svg>
    </div>
  );
}
```

Dikkat (implementer için):
- Spark daireleri `cx/cy` ile konumlanır, `transform` ile DEĞİL — `userSpaceOnUse`
  gradient'i transform'lu elemanda yanlış örneklenir (core rengi bozulur).
- SVG filter (feGaussianBlur vb.) KULLANMA — v2'nin bilinen rendering gotcha'sı.
  Glow = geniş `.glow` stroke + radial halo.
- Jog çiftinin iki köşe node'u aynı y'de olduğundan ikisi aynı anda yanar — kabul.

- [ ] **Step 3: Tip + lint kontrolü**

Run: `npx tsc --noEmit && npm run lint`
Expected: yeni hata yok.

- [ ] **Step 4: Commit**

```bash
git add components/marketing/EnergyLine.tsx components/marketing/EnergyLine.module.scss
git commit -m "home: EnergyLine — scroll-painted gold→cyan circuit overlay"
```

---

### Task 4: Home page'e bağla

**Files:**
- Modify: `app/[locale]/(marketing)/page.tsx`

- [ ] **Step 1: Import ekle ve section'ları sar**

Import bloğuna (diğer marketing importlarının yanına):

```tsx
import { EnergyLine } from "@/components/marketing/EnergyLine";
```

Return'deki section listesini sar — `JsonLd`'ler DIŞARIDA kalır (script tag'leri
section ölçümüne karışmasın):

```tsx
  return (
    <>
      <JsonLd data={localBusinessLd(locale)} />
      <JsonLd data={faqLd(faqItems)} />
      <EnergyLine>
        <Hero />
        <Intro />
        <Services />
        <HowItWorks />
        <ApplicationAreas />
        <CalculatorTeaser />
        <ProductsTeaser />
        <Testimonials />
        <FinalCta />
        <FaqTeaser />
      </EnergyLine>
    </>
  );
```

- [ ] **Step 2: Tip kontrolü + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build başarılı. (RSC uyumu: server section'lar client wrapper'a
`children` olarak geçiyor — hata beklenmez.)

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(marketing)/page.tsx"
git commit -m "home: wrap sections in EnergyLine"
```

---

### Task 5: Preview doğrulaması (spec checklist)

**Files:** — (davranış doğrulama; düzeltmeler çıkarsa ilgili dosyalar)

Dev server: `.claude/launch.json` içinde `minada` config'i hazır (npm run dev, port 3000). Claude Code'da `preview_start name=minada` kullan; sayfalar: `http://localhost:3000/tr` ve `/en`.

- [ ] **Step 1: Başlat ve konsolu kontrol et**

`preview_start` → `/tr`'ye git. `preview_console_logs level=error` boş olmalı;
`preview_logs level=error` (server) temiz olmalı.

- [ ] **Step 2: Desktop rota kontrolü**

`preview_eval`: `window.scrollTo(0, 0)` → adım adım (`window.scrollBy(0, innerHeight)`,
her adımda `preview_screenshot`) sayfa sonuna kadar in. Kontroller:
- Hat hero altından doğuyor, section'ların yanında dikey inip aralarda jog yapıyor.
- Boya ucu + spark hep viewport'un ~%55 hizasında.
- Node'lar boya geçtikçe yanıyor.
- Hat başlık/metin bloklarının ÜZERİNDEN geçmiyor (kenar insetleri yeterli).
- Dark band'lerde (Services) hat band'in içinden, yuvarlak köşeye çarpmadan geçiyor.
- HowItWorks pin bölgesinde hat düz dikey ve kayma hissi yok.

- [ ] **Step 3: Sayfa yüksekliği/CLS kontrolü**

`preview_eval`: `document.documentElement.scrollWidth <= window.innerWidth` → true
(yatay taşma yok). `preview_network filter=failed` boş.

- [ ] **Step 4: Mobil kontrolü**

`preview_resize preset=mobile` → reload → screenshot'lar: sol kenarda ~16px'te düz
hat, node yok, spark küçük halo ile çalışıyor. Sonra `preset=desktop`'a dön.

- [ ] **Step 5: EN sayfası**

`/en`'e git, bir kez orta scroll + screenshot: rota EN içerik boylarıyla da hizalı.

- [ ] **Step 6: Reduced motion**

Kod yolu incelemesiyle doğrula (emülasyon preview'da yok): `reduced` dalında
dashoffset=0, listener kurulmuyor, node'lar yanık, spark CSS ile gizli.
İstersen `preview_eval` ile `matchMedia('(prefers-reduced-motion: reduce)').matches`
değerinin false olduğunu ve normal yolda çalıştığını teyit et.

- [ ] **Step 7: Düzeltmeler + final commit**

Rota/inset/renk ince ayarı gerekirse sabitleri güncelle (`JOG_DROP`, `sideInset`,
stroke kalınlıkları, `--volt-soft` opasitesi), adım 2-5'i tekrarla ve commit'le:

```bash
git add -A && git commit -m "home: energy line verification tweaks"
```

Kanıt olarak son screenshot'ları kullanıcıya raporda göster.
