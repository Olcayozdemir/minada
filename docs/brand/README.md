# Marka kaynakları

Bu klasör `public/` altında değil, yani hiçbiri siteyle birlikte yayınlanmıyor.
Türetilmiş dosyaları yeniden üretmen gerekirse kaynak burada.

| Dosya | Ne |
|---|---|
| `minada-mark-master.png` | 2048², alfalı. **Açık zemin sürümü**: lacivert kontur, sol kol açık kontur. |
| `minada-mark-on-dark-master.png` | 2048², alfalı. **Koyu zemin sürümü**: kontur beyaza dönüyor, boşluklar açık sürümdeki gibi saydam kalıyor. |
| `minada-lockup-master.jpg` | 2000², beyaz zemin. Marka + MİNADA yazısı + "Enerji - Mühendislik". Yazılı kilide ihtiyaç olursa. |

İki usta **aynı geometride** (kırpılmış oran 1.719 ve 1.725, fark %0.3; siluet
örtüşmesi %86).
Header açık↔koyu geçişinde logo yerinden oynamasın diye bu şart; yeni bir varyant
üretilirse aynı ölçüyle doğrulanmalı.

## Türetilenler

`node docs/brand/rebuild-logo.mjs` (repo kökünden) hepsini yeniden basar.

| Çıktı | Ölçü | Kaynak | Not |
|---|---|---|---|
| `public/logo/logo1.png` | 413×240 | açık usta | Header (kaydırılmış) + mobil menü |
| `public/logo/logo1-on-dark.png` | 414×240 | koyu usta | Header (hero üstünde) + footer |
| `app/icon.png` | 512² | açık usta | Favicon, saydam zemin |
| `app/apple-icon.png` | 180² | açık usta | iOS; alfayı siyaha bastığı için beyaz zeminli |

**Logolar tam renk, ikonlar paletli.** 256 renge düşürmek güneşin ve yaprakların
degradelerini bantlıyor; 16-32px basılan ikonlarda ise fark görünmüyor ve favicon
her sayfada ham servis edildiği için boyut orada gerçekten önemli.

## Bağlantı

`Logo.tsx` bir `tone` prop'u alıyor: `light` (varsayılan), `dark`, `adaptive`.
`adaptive` iki görseli de basar, CSS `HeaderShell`'in `[data-scrolled]` niteliğine
bakarak birini gizler. Header `adaptive`, Footer `dark`, mobil menü varsayılan
(drawer zemini `var(--bg)`, yani açık).

Sol kolun içini dolduran bir koyu varyant da denendi ve **elendi**: 40px'te
beyaz kütle harfin dengesini bozup illüstrasyonlu kolları ikinci plana atıyordu.

Marka 30px'te okunmuyordu — yaprak damarları ve güneş ışınları piksel altına
düşüyordu. **40px**'e çıkarıldı; header pill'i 66px ve en uzun elemanı 44px CTA
olduğu için layout'a maliyeti yok.

## Not

Koyu sürümü üretirken **metin-görsel değil, görsel düzenleme (edit) modu** kullan
ve "hiçbir şeyi yeniden çizme, sadece kontur rengini değiştir" diye kısıtla. Serbest
üretimde model harfi baştan çiziyor: ilk denemede oran %31 sapmış, siluet örtüşmesi
%27'ye düşmüştü.

OG / paylaşım kartı ayrı bir şablondan basılıyor: `docs/brand/og/`.
