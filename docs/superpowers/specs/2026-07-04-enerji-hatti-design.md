# Enerji Hattı — scroll ile boyanan devre çizgisi (home)

**Tarih:** 2026-07-04 · **Durum:** Onaylandı (Olcay)
**Kapsam:** Yalnızca ana sayfa. Tek yeni komponent + token ekleme; mevcut section'lara dokunulmaz.

## Fikir

Home page'in tamamı boyunca inen tek bir "elektrik hattı": devre şeması gibi köşeli,
section'ların yanından/arasından kıvrılan bir SVG çizgisi. Scroll ilerledikçe hat
boyanır; boyanın ucunda parlayan bir spark okuma hizasını takip eder. Hikâye:
**güneş ışığı (gold) yukarıda doğar, aşağı indikçe elektriğe (cyan) dönüşür.**

## Onaylanan kullanıcı seçimleri

1. **Şekil:** Gezen devre hattı (kenar progress'i ya da orta omurga değil).
2. **Renk:** Gold→cyan dikey geçiş — üstte gold, hero altından itibaren cyan.
3. **Mobil:** Basitleştirilmiş düz hat (sol kenara yakın), aynı boyama mekaniği.
4. **Teknik:** Otomatik tek path — DOM ölçümünden üretilen adaptif SVG
   (el çizimi sabit SVG ve section-başına parçalı yaklaşımlar elendi).

## Marka notu (bilinçli kısıt değişikliği)

v2 "Altın Saat" spec'i cyan'ı 3D ev kesitinin kendi çizgileriyle sınırlamıştı.
Bu tasarım, cyan'ı **yalnızca enerji hattına özel** ikincil "elektrik" aksanı olarak
palete ekler (kullanıcı onaylı). Cyan başka hiçbir UI öğesinde kullanılmaz.

- Yeni token'lar (`styles/tokens.css`): `--volt: #29d6ff` (hat cyan'ı),
  `--volt-soft: rgba(41, 214, 255, 0.16)` (track/glow tonu). Dekoratif kullanım —
  metin rengi olarak kullanılmayacağı için AA kontrast şartı aranmaz.

## Mimari

- **Yeni:** `components/marketing/EnergyLine.tsx` (client) + `EnergyLine.module.scss`.
- `app/[locale]/(marketing)/page.tsx` içinde tüm section'lar `<EnergyLine>` ile sarılır.
  Server-rendered section'lar client wrapper'a `children` olarak geçer (RSC uyumlu);
  section komponentlerinde değişiklik yok.
- Render yapısı: `position:relative` wrapper → `{children}` → üstte
  `position:absolute; inset:0; pointer-events:none; aria-hidden` tek SVG overlay.
- Katman: hat section arka planlarının ve içeriğin üzerinde, header'ın (z:200) altında
  (overlay z-index ~5). İçerikle çakışma path rotasıyla önlenir (aşağıda).

## Path üretimi

Mount + resize'da wrapper'ın doğrudan `<section>` çocukları ölçülür
(`getBoundingClientRect` + scrollY) ve tek path kurulur:

- **Rota kuralı:** Hat her section'ın yanında dikey iner; section'dan section'a
  **sol↔sağ dönüşümlü**. Yatay geçişler (jog) iki section arasındaki seam kuşağında —
  section'ların `padding-block`'u sayesinde bu bant içeriksizdir, çizgi metinle çakışmaz.
- **Dikey konum:** her section için x, **o section'ın kendi rect'inden** hesaplanır:
  section kenarından sabit ~28px içeride. Böylece dark band'lerde (`margin-inline`'lı,
  yuvarlak köşeli) hat band'in **hemen içinden** geçer ve köşe yuvarlaklığıyla çakışmaz;
  tam genişlik section'larda viewport kenarına yakın akar.
- **Köşeler:** ~24px radius quadratic yuvarlatma — devre/PCB hissi.
- **Node'lar:** her köşe dönüşünde küçük daire (r≈3px). Boya node'u geçince `data-on`
  ile "yanar" (dolgu track renginden volt/gold'a döner).
- **Pinned bölge istisnası:** HowItWorks'ün uzun pinned stage'i boyunca hat **tam dikey**
  tutulur, jog yapılmaz — dikey segment dikey kayarken hareketsiz göründüğünden pin
  sırasında rahatsız edici kayma olmaz.
- **Uçlar:** hat hero'nun alt kısmından başlar (panellerin oradan "doğar"),
  son section'ın sonunda footer'a girmeden küçük bir uç node'uyla biter.

## Boyama mekaniği

- İki üst üste path: altta **track** (`--volt-soft`; hem açık hem lacivert zeminde
  seçilebilir yarı saydam ton), üstte **painted** path.
- Boyama: `stroke-dasharray = L`, `stroke-dashoffset = L·(1−p)` (L = `getTotalLength()`).
- **p, y-eşlemeli:** path ~200 noktada örneklenip kümülatif uzunluk↔y lookup tablosu
  kurulur; hedef y = `scrollY + 0.55·viewportHeight`. Böylece boya ucu yatay joglarda
  bile hep okuma hizasını takip eder (sayfa-oranı progress'in yatay segmentlerde
  ileri/geri kaçması sorunu yaşanmaz).
- **Spark:** boya ucunda `getPointAtLength` ile konumlanan küçük parlak çekirdek +
  radial-gradient halo dairesi. SVG filter KULLANILMAZ (v2'nin bilinen rendering
  gotcha'sı); glow etkisi, painted path'in altındaki daha kalın düşük-opasiteli
  üçüncü stroke + spark'ın radial gradient'iyle verilir.
- **Gradient:** `linearGradient gradientUnits="userSpaceOnUse"` dikey — y=0'da
  `--gold`, hero altı (~%20)'dan itibaren `--volt`, sayfa sonuna kadar cyan.
- **Scroll:** passive listener + rAF (HowScrollFx/SinkOnScroll ile aynı pattern);
  scroll'da yalnızca dashoffset + spark transform + node toggle güncellenir.
- **Resize:** ResizeObserver (wrapper) + window resize → yeniden ölç, path'i yeniden kur.

## Mobil (<1024px)

Aynı komponent basit moda düşer: sol kenardan ~16px sabit x'te düz dikey hat.
Jog ve node yok, spark daha küçük (halo yarıçapı düşük). Boyama + gradient aynı.

## Erişilebilirlik / fallback

- SVG `aria-hidden="true"` — tamamen dekoratif, ekran okuyucuya görünmez.
- `prefers-reduced-motion: reduce`: hat **tamamen boyalı statik** render edilir;
  spark yok, scroll listener kurulmaz.
- JS yok / mount öncesi: hat hiç render edilmez (path DOM ölçümü gerektirir);
  sayfa hattın yokluğunda eksiksizdir. Progressive enhancement.
- CLS yok: overlay absolute konumlu, layout'a katılmaz.

## Performans

- Tek SVG, iki-üç path + az sayıda node; scroll başına yalnızca attribute/transform
  yazımı (layout tetiklemez). `getPointAtLength` çağrısı frame başına 1 adet.
- Lookup tablosu yalnızca path kurulurken hesaplanır.

## Doğrulama

Otomatik test altyapısı yok; görsel efekt için uygun da değil. Preview'da manuel:

1. TR + EN home'da hat tüm section'ları geziyor, içerik metinleriyle çakışmıyor.
2. Scroll'da boya ucu + spark okuma hizasını takip ediyor; node'lar sırayla yanıyor.
3. HowItWorks pin bölgesinde hat kaymıyor (dikey segment).
4. Mobil viewport'ta basit hat; desktop'ta devre rotası.
5. `prefers-reduced-motion` emülasyonunda statik tam boyalı hat.
6. Resize sonrası hat section'larla hizalı kalıyor.
7. Konsolda hata yok; scroll FPS'te gözle görülür düşüş yok.

## Kapsam dışı (YAGNI)

- İç sayfalarda hat yok (yalnızca home).
- Dallanma/çatallanma, animasyonlu "akım pulse"ı, hover etkileşimi yok.
- Sanity'den yapılandırma yok — rota tamamen otomatik.
