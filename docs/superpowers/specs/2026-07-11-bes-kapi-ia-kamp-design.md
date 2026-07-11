# MİNADA — "5 Kapı" Bilgi Mimarisi + Kamp/Taşınabilir Güç + Tasarım Dili Yayılımı

> Tarih: 2026-07-11 · Durum: Olcay onaylı tasarım (bu oturumda 7 karar interaktif alındı)
> Önceki plan: `docs/site-akisi-ia-plani.md` (2026-07-04) — bu spec onun "Evim/İşletmem birincil çatal"
> kararını **revize eder**; kalan kısımları (katalog kuralları, süreç bölümü, kalıcı CTA) geçerli kalır.
> Kaynaklar: Okan görüşme özeti (7.07 raporu — "4 iş kolu mimarisi" onaylı), ankersolixtr.com ürün taraması,
> piyasa kontrolü (Enpal, 1KOMMA5°, EcoFlow, Anker SOLIX: birincil nav **iş kolu/ürün bazlı**, kitle ayrımı
> sayfa içinde ya da ikincil menüde).

---

## 0. Alınan kararlar (Olcay, 2026-07-11)

| Konu | Karar |
|---|---|
| Birincil eksen | **İş kolu bazlı "5 kapı":** GES · Enerji Depolama · Isı Pompası · EV Şarj · Kamp & Outdoor. "Evim/İşletmem" birincil çatal olmaktan çıkar; sayfaları silinmez, "Sizin için" sütununa iner ve zenginleşir. |
| Kamp yapısı | Segment + landing + katalog kategorisi (üçü birden). |
| Kamp ürün kapsamı | **Sadece kamp odaklılar.** F3000 / F3800 / BP3800 girmez. |
| Hero CTA | "Ücretsiz Keşif" (gold) + "Çözümlerimiz" (glass → yönlendiriciye scroll). Evim/İşletmem butonları hero'dan çıkar. |
| Tasarım dili | Lit-stage imzası ortak parçaya çıkar, önerilen kapsamda yayılır. Blog + Nasıl Çalışır'a dokunulmaz. |
| Görseller | Anker ürün görselleri ankersolixtr.com'dan indirilip self-host edilir (hotlink yok — mevcut katalog kuralı). |
| Tur kapsamı | Hepsi, fazlı: İA+nav+router → kamp kataloğu+landing → hizmet sayfaları → tasarım yayma+küçük işler. Her faz sonunda build yeşil + commit. |
| Hero aydınlık görseli | **Bu tura girmez** (Okan'ın "görsel hiç karanlık durmasın" notu ayrı asset turu — Marstek tarzı gündüz render'ı). |

## 1. Navigasyon

Tek "Çözümler" maddesi iki sütunlu bir **mega dropdown**'a dönüşür (Header'da Radix tabanlı mevcut
dropdown genişletilir; MobileNav'da iki başlıklı akordeon/liste):

```
Çözümler ▾
├─ İŞ KOLLARIMIZ                          ├─ SİZİN İÇİN
│  Güneş Enerjisi (GES)                   │  Evim için            → /cozumler/evim-icin (mevcut)
│  Enerji Depolama (BESS)                 │  İşletmem için        → /cozumler/isletmem-icin (mevcut)
│  Isı Pompası                            │  Kamp & Outdoor       → /cozumler/kamp-outdoor (YENİ)
│  EV Şarj İstasyonları                   │
```

Kalanlar aynen: Ürünler · Nasıl Çalışır · Hesaplayıcı · Hakkımızda · [Ücretsiz Keşif CTA].

### Rotalar (i18n/routing.ts — localized pathnames)

| Canonical | TR | EN |
|---|---|---|
| `/hizmetler/gunes-enerjisi` | aynı | `/services/solar-energy` |
| `/hizmetler/enerji-depolama` | aynı | `/services/energy-storage` |
| `/hizmetler/isi-pompasi` | aynı | `/services/heat-pump` |
| `/hizmetler/ev-sarj` | aynı | `/services/ev-charging` |
| `/cozumler/kamp-outdoor` | aynı | `/solutions/camping-outdoor` |

Not: 4 iş kolu sayfası tek dinamik route (`/hizmetler/[line]`) yerine **4 ayrı statik route** olarak
açılır (SSG + `StaticPathname` tip zinciri sade kalır; her sayfanın içerik yapısı zaten farklılaşıyor).
`lib/site.ts`'e `BUSINESS_LINES = ["ges", "bess", "heatpump", "evcharge"]` + kamp girişi; `SERVICES`
(rooftop/ground/agripv/carport/bess) **GES sayfasının içine** iner (bess çıkar → kendi sayfası),
footer iki sütun olur: "İş kollarımız" (4) + "Sizin için" (3).

## 2. Ana sayfa akışı

1. **Hero** — görsel/tipografi aynen; aksiyonlar: `[Ücretsiz Keşif]` (gold, → /contact) +
   `[Çözümlerimiz]` (glass, → `#cozumler` yönlendiriciye smooth-scroll). Hesaplayıcı kartı kalır.
2. **Yönlendirici ("5 kapı")** — mevcut Services koyu bandı yeniden inşa edilir: 5 lit-stage kart
   (dark varyant): GES, Depolama, Isı Pompası, EV Şarj, Kamp & Outdoor. Kart = 3D render (mevcut
   `public/images/products/*.png` yeniden kullanılır; kamp için yeni görsel) + 1 cümle + **kitle
   çipleri** ("Konut · Ticari", "Villa · Otel", "Ev · İşyeri", "Kamp · Karavan · Tekne") + dolan
   çizgi/ok imzası. Mobil: yatay scroll-snap (mevcut kalıp).
3. **Nasıl Çalışır** — dokunulmaz (Okan: süreç kalıyor).
4. **Hesaplayıcı teaser** — kalır (GES odaklı olduğu belli edilir).
5. **Ürünler teaser** — kalır; kategori listesine Taşınabilir Güç girer (ilk 6'da görünmesi için order ayarı).
6. **ApplicationAreas / Referanslar / SSS / Final CTA** — içerik aynı, tasarım imzası uygulanır (Faz: tasarım yayma).

Eski `Home.services`/`Home.applicationAreas` mesaj anahtarlarından kullanılmayanlar temizlenir
(tr/en paritesi korunur).

## 3. Katalog — "Taşınabilir Güç" kategorisi

`lib/catalog-data.ts`:

- `CATEGORIES`'e: `{ _id: "cat-tasinabilir-guc", title: "Taşınabilir Güç", slug: "tasinabilir-guc", order: 4, icon: "portable" }`
  (order 4 = Enerji Depolama'nın hemen ardı; sonraki kategorilerin order'ı kaydırılır). Yeni `portable`
  ikonu `components/ui/icons.tsx`'e (mevcut çizgi stilinde) eklenir.
- `BRAND`'e: `anker: { title: "Anker SOLIX", slug: "anker-solix" }`.
- Yeni gruplar (Anker SOLIX — kaynak ankersolixtr.com, fiyatsız, teknik özet + özellik çipleri):

| Grup | Güç/Kapasite | Özellik çipleri |
|---|---|---|
| C300 DC Taşınabilir Güç İstasyonu | 288 Wh · 300 W | lfp, usbC, lightweight |
| C300X Taşınabilir Güç İstasyonu | 288 Wh · 300 W | lfp, acOutlet, fastCharge |
| C1000X PowerHouse | 1056 Wh · 1800 W | lfp, fastCharge, appControl |
| C1000 Gen 2 | 1024 Wh · 2000 W | lfp, fastCharge, expandable |
| C2000 Gen 2 | ~2048 Wh · 2400 W | lfp, expandable, appControl |
| F1500 PowerHouse | 1536 Wh · 1800 W | lfp, homeBackup, appControl |
| 767 PowerHouse | 2048 Wh · 2400 W | lfp, rvReady, expandable |
| PS200 Katlanabilir Solar Panel | 200 W | foldable, ip67, kickstand |
| PS400 Katlanabilir Solar Panel | 400 W | foldable, ip67, highEff |
| EverFrost Akülü Kamp Buzdolabı | 40/43 L · 299 Wh | battery, compressor, dualZone* |

\* Uygulamada ürün sayfalarından doğrulanacak; emin olunamayan çip düşülür. C2000 Gen 2 spec'i
ürün sayfasından teyit edilir.

- **TommaTech taşınmaları:** gizli 7 taşınabilir/katlanabilir panel (`Easy Life`, `Flexible` serileri)
  bu kategoriye taşınır ve `hidden: false` olur; `enerji-depolama`daki "Easy Living — Taşınabilir Güç
  İstasyonu" da buraya taşınır. (Enerji Depolama sabit BESS'e saflaşır.)
- **Görseller:** ürün fotoğrafları ankersolixtr.com ürün sayfalarından indirilir →
  `public/products/portable/*.{jpg,webp}` + `IMAGES` map'ine eklenir. Kategori tile görseli:
  Anker cutout'u lit-stage üzerinde (`public/images/products/portable-power.png`); mevcut 3D render
  stiliyle uyumsuz kalırsa ayrı turda render üretilir.
- **Sanity:** `scripts/seed-products.mjs` zaten `CATEGORIES`/`GROUPS_ALL`'dan besleniyor — seed yeniden
  çalıştırılır (token `.env.local`'de; **kategori order güncellemeleri dahil** idempotent çalıştığı
  doğrulanır; içerik değişikliği sonrası dev server restart gerekir).
- Mesajlar: `Products.categories.tasinabilir-guc`, `catDesc`, yeni özellik çipi anahtarları (tr/en).

## 4. Kamp landing — `/cozumler/kamp-outdoor`

Bölümler:
1. **Hero şeridi** — outdoor foto (Unsplash, `public/images/v2/` düzenine uygun + CREDITS) + başlık
   ("Şehir şebekesi nereye kadar?" tonunda) + keşif/ürün CTA'ları.
2. **"Hangi boy bana yeter?"** — 3 satırlık Wh rehberi (lit-stage kartlar):
   - Hafta sonu kampı (telefon, ışık, drone) → C300/C300X + PS200
   - Kamp + buzdolabı/küçük ev aletleri → C1000 ailesi + PS400 + EverFrost
   - Karavan · tekne · uzun konaklama → 767 / F1500 / C2000 + çift panel
3. **Öne çıkan ürünler** — kategoriden 4-6 kart (mevcut ürün kartı bileşeni) → `/urunler/tasinabilir-guc`.
4. **Neden MİNADA** — kısa 3 madde (yetkili tedarik, kurulum danışmanlığı, teklif hızı).
5. **CTA** — teklif formu (`?konu=kamp` prefill).

## 5. İş kolu sayfaları (4 sayfa, ortak şablon)

Her sayfa: hero şeridi (başlık + 1 paragraf + keşif CTA) → **kitle bölümleri** ("Konut" / "Ticari"
veya sayfaya uygun ayrım) → ürün köprüsü (ilgili katalog kategorilerine lit-stage kartlar) →
mini SSS (2-3 soru) → Final CTA (`?konu=` prefill). İçerik mevcut mesajlardan + yeni kısa metinlerden;
SEO başlık/description `generateMetadata` + `buildAlternates` ile.

- **GES** (`/hizmetler/gunes-enerjisi`): 4 tip (Çatı, Arazi, Agri-PV, Carport) mevcut Services
  içeriğinden taşınır; Konut/Ticari bölümleri `/cozumler/evim-icin|isletmem-icin`'e köprü verir.
  Anahtar kelimeler: imar, ÇED, ruhsat, proje geliştirme (süreç bölümünde).
- **Enerji Depolama** (`/hizmetler/enerji-depolama`): ev tipi + ticari/konteyner ESS; katalogdaki
  `enerji-depolama` kategorisine köprü.
- **Isı Pompası** (`/hizmetler/isi-pompasi`): ısıtma-soğutma, yerden ısıtma; **Havuz Isı Pompası
  bölümü** (villa/otel — katalogdaki Aquavera'ya köprü). Anahtar kelimeler: ısı pompası, yerden
  ısıtma, ısıtma-soğutma.
- **EV Şarj** (`/hizmetler/ev-sarj`): ev/işyeri AC + ticari DC; carport GES çapraz linki.

**Evim için / İşletmem için** sayfalarına ısı pompası + EV şarj bölümleri eklenir (Okan onaylı);
içerikleri ilgili iş kolu sayfalarına köprü verir.

## 6. Lead formu — "konu" alanı

- `lib/lead-schema.ts`: `topic` enum (`ges | depolama | isi-pompasi | ev-sarj | kamp | diger`), optional.
- `LeadForm`: select alanı; `?konu=` query'den prefill (mevcut `?urun=` kalıbıyla aynı).
- `lib/email.ts` + `/api/lead`: e-posta konusuna/e-posta gövdesine etiket ekler ("[Kamp]" gibi).
- Tüm yeni CTA'lar kendi konusunu taşır.

## 7. Tasarım dili yayılımı

- `styles/mixins`'e (veya yeni `styles/signature.scss`): `lit-stage` (gold wash + dot grid + sand fade;
  `dark` varyantı navy üstü için), `foot-rule` (altınla dolan çizgi), `go-chip` (dönen ok) mixin'leri.
  `CategoryGrid.module.scss` bunları tüketecek şekilde sadeleşir (görsel çıktı değişmez).
- Uygulanan bölümler: Yönlendirici kartları (dark), ApplicationAreas tile'ları, CalculatorTeaser,
  Testimonials/FAQ kartları, Evim/İşletmem + iş kolu sayfası kartları, kamp landing kartları.
- **Dokunulmaz:** Blog (magazine düzeni), HowItWorks (editorial figürler — zaten aynı DNA).
- Görsel ilke: parlaklık yalnız UI değil; yeni üretilecek/seçilecek görseller de glass + gold glow
  ışık dilinde olur (mevcut kategori render'ları referans).

## 8. Hızlı işler

- `lib/site.ts`: `phone: "+90 536 041 76 44"`, `instagram: "https://instagram.com/minadaenerji"`.
- Placeholder telefonun render edildiği her yer (Footer, Contact) gerçek numarayı gösterir.

## 9. Kapsam dışı / park

- Hero aydınlık görsel değişimi (ayrı asset turu — Marstek tarzı gündüz render).
- Domain/go-live, adresler, Hakkımızda içeriği, hesaplayıcı gerçek katsayıları (🟡 Okan'dan bekleniyor).
- E-ticaret, mini oyun, izleme entegrasyonu (⚪ park).
- F3000/F3800/BP3800 (ileride "Ev Yedek Gücü" açılırsa değerlendirilir).
- Anker V1 EV şarj cihazının `ev-sarj` kategorisine eklenmesi (ayrı karar — TommaTech'le yan yana
  marka stratejisi Okan'a sorulmalı).

## 10. Uygulama fazları

1. **İA temeli** — routing + nav mega dropdown + MobileNav + footer + hero CTA + mesajlar (tr/en).
2. **Katalog** — kategori + Anker grupları + görsel indirme/optimizasyon + TommaTech taşımaları +
   ikon + mesajlar + Sanity seed.
3. **Yönlendirici** — Services bandının 5 kapıya dönüşümü (dark lit-stage + kitle çipleri).
4. **Kamp landing.**
5. **İş kolu sayfaları** (4) + Evim/İşletmem zenginleştirme + havuz bölümü.
6. **Lead formu konu alanı** + iletişim/Instagram düzeltmesi.
7. **Tasarım yayma** — mixin çıkarımı + listelenen bölümler.

Her faz: `npm run build` + lint yeşil → odaklı commit (`git add <paths>` — paralel oturum riski).
i18n: tr.json/en.json anahtar paritesi her fazda korunur. Next 16: koddan önce
`node_modules/next/dist/docs/` kontrolü (AGENTS.md kuralı); `setRequestLocale` her yeni layout/page'de.
