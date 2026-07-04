# Enerji Hattı — scroll ile boyanan dalga (home)

**Tarih:** 2026-07-04 · **Durum:** Onaylandı (Olcay) · Rev.2 aynı gün
**Kapsam:** Yalnızca ana sayfa. Tek yeni komponent + token + z-katman düzeni.

## Fikir

Home page'in tamamı boyunca sayfanın ortasından akan tek bir "enerji dalgası":
yumuşak S-kavisleriyle merkez etrafında salınan bir SVG çizgisi. Hat **içeriğin
arkasında** durur — görsellerin, kartların ve metnin altından geçer, yalnızca
section zeminlerinin üzerinde görünür. Scroll ilerledikçe hat boyanır; boyanın
ucunda parlayan bir spark okuma hizasını takip eder. Hikâye: **güneş ışığı (gold)
yukarıda doğar, aşağı indikçe elektriğe (cyan) dönüşür.**

## Onaylanan kullanıcı seçimleri

1. **Şekil (Rev.2):** Ortadan akan yumuşak dalga, içerik arkasında. İlk sürümdeki
   kenarları gezen köşeli devre hattı kullanıcı tarafından beğenilmedi ve elendi
   ("dalga gibi olsun, ortadan geçebilir ama görsellerin önünden geçmesin").
2. **Renk:** Gold→cyan dikey geçiş — üstte gold, hero altından itibaren cyan.
3. **Mobil (Rev.3):** Hat mobilde YOK — dar genlikli dalga denendi, kullanıcı
   beğenmedi; efekt yalnızca desktop (≥1024px).
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
- **Katman (Rev.2):** overlay `z-index:1`; `Section` içerik konteyneri (`.inner`)
  ile Hero/FinalCta panelleri `z-index:2`. Böylece hat section ZEMİNLERİNİN
  üzerinde ama tüm içeriğin (görsel, kart, metin) altında akar; Hero ve FinalCta
  gibi tam-panel fotoğraf bölümlerinde hattın o aralığı panelin arkasına dalar.
  Header (z:200) her zaman üstte.

## Path üretimi

Mount + resize'da wrapper'ın doğrudan `<section>` çocukları ölçülür
(`getBoundingClientRect` + scrollY) ve tek path kurulur:

- **Rota kuralı (Rev.5):** KESİNTİSİZ dalga — düz segment yok (Rev.4'ün kenarda
  düz inen hali kullanıcı tarafından reddedildi). Her section'a bir tepe (crest)
  düşer, yanlar dönüşümlü; ~900px'ten uzun section'lara ek tepe eklenir. Geniş
  genlik sayesinde tepe section ortasında sayfanın iyice sağında/solunda gezer,
  merkez yalnızca tepeler arasında (section geçişlerine denk gelen bölgede)
  kesilir. Dikey teğetli kübik Bézier'ler.
- **Genlik (Rev.5):** `min(vw·0.34, 500px)` — 1440'ta tepeler x≈230/1210.
- **Uçlar:** hat hero'nun alt kısmından merkezden doğar (panellerin arkasından),
  son section'ın sonunda merkezde, footer'a girmeden biter.
- **Pinned bölge:** hat pinned içeriğin arkasında olduğundan özel durum gerekmez;
  pin sırasında dalganın yavaşça yukarı süzülmesi kabul edilen bir etkidir.

## Boyama mekaniği

- İki üst üste path: altta **track** (`--volt-soft`; hem açık hem lacivert zeminde
  seçilebilir yarı saydam ton), üstte **painted** path.
- Boyama: `stroke-dasharray = L`, `stroke-dashoffset = L·(1−p)` (L = `getTotalLength()`).
- **p, y-eşlemeli:** path ~600 adımda örneklenip kümülatif uzunluk↔y lookup tablosu
  kurulur; hedef y = `scrollY + 0.55·viewportHeight`. Böylece boya ucu, kavisler
  yüzünden uzayan segmentlerde bile hep okuma hizasını takip eder (dalganın kübikleri
  y'de monotonik — lookup buna dayanır).
- **Spark:** boya ucunda `getPointAtLength` ile konumlanan küçük parlak çekirdek +
  radial-gradient halo dairesi. SVG filter KULLANILMAZ (v2'nin bilinen rendering
  gotcha'sı); glow etkisi, painted path'in altındaki daha kalın düşük-opasiteli
  üçüncü stroke + spark'ın radial gradient'iyle verilir.
- **Gradient:** `linearGradient gradientUnits="userSpaceOnUse"` dikey — y=0'da
  `--gold`, hero altı (~%20)'dan itibaren `--volt`, sayfa sonuna kadar cyan.
- **Scroll:** passive listener + rAF (HowScrollFx/SinkOnScroll ile aynı pattern);
  scroll'da yalnızca dashoffset + spark konumu güncellenir.
- **Resize:** ResizeObserver (wrapper) + window resize → yeniden ölç, path'i yeniden
  kur. Sıfır boyutta kurulduysa ilk scroll'da kendini onarır.

## Mobil (≤1023px)

Hat mobilde render edilmez: CSS `display:none` + JS build atlar (Rev.3, kullanıcı
kararı). Breakpoint geçişlerinde resize/RO rebuild'i modu doğru tarafa çevirir.

## Erişilebilirlik / fallback

- SVG `aria-hidden="true"` — tamamen dekoratif, ekran okuyucuya görünmez.
- `prefers-reduced-motion: reduce`: hat **tamamen boyalı statik** render edilir;
  spark yok, scroll listener kurulmaz.
- JS yok / mount öncesi: hat hiç render edilmez (path DOM ölçümü gerektirir);
  sayfa hattın yokluğunda eksiksizdir. Progressive enhancement.
- CLS yok: overlay absolute konumlu, layout'a katılmaz.

## Performans

- Tek SVG, üç path + spark; scroll başına yalnızca attribute/transform yazımı
  (layout tetiklemez). `getPointAtLength` çağrısı frame başına 1 adet.
- Lookup tablosu yalnızca path kurulurken hesaplanır.

## Doğrulama

Otomatik test altyapısı yok; görsel efekt için uygun da değil. Preview'da manuel:

1. TR + EN home'da dalga tüm sayfa boyunca akıyor, yükseklik farkına uyum sağlıyor.
2. Scroll'da boya ucu + spark okuma hizasını takip ediyor; hat görsel/kart/metnin
   arkasında kalıyor, yalnızca zeminlerde görünüyor.
3. Hero ve FinalCta panellerinde hat panelin arkasına dalıp çıkıyor.
4. Mobilde hat yok; desktop'ta dalga, yatay taşma yok.
5. `prefers-reduced-motion` emülasyonunda statik tam boyalı hat.
6. Resize sonrası hat section'larla hizalı kalıyor.
7. Konsolda hata yok; scroll FPS'te gözle görülür düşüş yok.

## Kapsam dışı (YAGNI)

- İç sayfalarda hat yok (yalnızca home).
- Dallanma/çatallanma, animasyonlu "akım pulse"ı, hover etkileşimi yok.
- Sanity'den yapılandırma yok — rota tamamen otomatik.
