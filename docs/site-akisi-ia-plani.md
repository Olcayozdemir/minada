# MINADA — Site Akışı & Bilgi Mimarisi Planı

> Tarih: 2026-07-04 · Durum: Faz 1–3 uygulandı · Faz 4 blocker'da · Faz 5 kısmi
> Bu doküman diğer agent'ların doğrudan uygulayabileceği şekilde fazlara bölünmüştür.
> Kod tabanı: Next.js 16 + next-intl (`messages/tr.json`, `messages/en.json`) + Sanity CMS.
>
> **İlerleme (2026-07-04):** Faz 1 (tekrar giderildi: Hizmetler 5 kart, Nasıl Çalışır 6 adım) ✅ ·
> Faz 2 (Hero ikili CTA, `/cozumler/*` sayfaları, nav dropdown, footer'a Blog/SSS) ✅ ·
> Faz 3 (Sanity şemaları, seed scripti, `/urunler` vitrini, lead'e ürün alanı, ana sayfa ürünler teaser'ı) ✅
> — kalan ops: `npm run seed:products` çalıştırma + Studio'dan görsel yükleme.

---

## 1. Teşhis — mevcut sorunlar

1. **Hizmetler bölümü iki farklı şeyi karıştırıyor.** 10 karttan 5'i müşteri teklifi (Çatı GES, Arazi GES, Agri-PV, Carport, BESS), 5'i ise sürecin adımları (Mühendislik & Etüt, Proje & Lisanslama, Tedarik, Saha Kurulumu, O&M). Süreç adımları "Nasıl Çalışır" bölümüyle birebir çakışıyor ("Keşiften işletmeye" vs "Keşiften devreye alışa" — aynı vaat iki kez).
2. **Tek bir ana akış yok.** Ziyaretçi hangi sırayla ne yapacağını görmüyor; bölümler bağımsız bloklar gibi duruyor.
3. **Hedef kitle karışık.** Hero/referanslar villa sahibine, hizmet metinleri sanayiciye konuşuyor.
4. **Ürünler/katalog hiç yok.** Panel/ekipman vitrini eksik (seed verisi hazır: `docs/katalog-seed.md`).
5. **GES dışı hizmetler (asansör, VRF, heat pump) sitede yok** — feedback: eklenmeli ama GES odağını bozmadan.

## 2. Alınan kararlar (Olcay onaylı)

| Konu | Karar |
|---|---|
| Elektromekanik (asansör, VRF, heat pump, EV şarj) | **Ayrı ikinci sütun.** GES ana odak; "Elektromekanik Çözümler" ikincil hizmet ailesi. |
| Hedef kitle | **İkili giriş:** ana sayfada "Evim için / İşletmem için" segment ayrımı; her segment kendi akışını görür. |
| Katalog | **Grup bazlı vitrin.** 37 grup marka/seriye göre kart; teknik özet + garanti; fiyat yok; CTA → teklif formu. Sanity'den yönetilir. |

## 3. Yeni bilgi mimarisi

### 3.1 Navigasyon (üst menü)

```
Çözümler ▾            Ürünler        Nasıl Çalışır    Referanslar    Hesaplayıcı    Hakkımızda    [Ücretsiz Keşif →]
 ├─ Evim için GES
 ├─ İşletmem için GES
 │   ├─ Çatı Üstü GES
 │   ├─ Arazi Tipi GES (Lisanssız)
 │   ├─ Tarımsal GES (Agri-PV)
 │   ├─ Carport / Otopark GES
 │   └─ Enerji Depolama (BESS)
 └─ Elektromekanik
     ├─ Asansör Sistemleri
     ├─ VRF İklimlendirme
     ├─ Isı Pompası (Heat Pump)
     └─ EV Şarj İstasyonu
```

- Mevcut `Nav.services` + `Nav.solutions` → tek "Çözümler" çatısında birleşir (Hizmetler ve Uygulama Alanları ayrı nav maddesi olmaktan çıkar).
- Blog ve SSS footer'a + ilgili sayfa içlerine iner (nav sadeleşir).
- Kalıcı CTA: "Ücretsiz Keşif" (tüm sayfalarda aynı buton, aynı lead formuna gider).

### 3.2 Sayfa haritası

| Route | İçerik | Durum |
|---|---|---|
| `/` | Segmentli ana sayfa (aşağıda) | Yeniden düzenle |
| `/cozumler/evim-icin` | Konut GES landing (hesaplayıcı entegre) | **Yeni** |
| `/cozumler/isletmem-icin` | Ticari GES hub (5 GES alt hizmeti) | **Yeni** (mevcut `/services` evrilir) |
| `/cozumler/elektromekanik` | Asansör, VRF, heat pump, EV şarj | **Yeni** |
| `/urunler` | Katalog vitrini (kategori > marka > seri grubu) | **Yeni** |
| `/how-it-works` | 6 adımlı genişletilmiş süreç (aşağıda) | Genişlet |
| `/projects`, `/calculator`, `/about`, `/contact`, `/faq`, `/blog` | Mevcut | Küçük rötuş |

## 4. Ana sayfa akışı (öncelik sıralı)

Tek anlatı: **"Kim olduğunu seç → ne kazanacağını gör → nasıl olacağını anla → kanıt → harekete geç."**

1. **Hero** — tek vaat + iki segment kartı: **"Evim için"** / **"İşletmem için"**. (Birincil CTA'lar bunlar; ikincil: Ücretsiz Keşif.)
2. **Segment şeridi** — seçime göre 3'er madde: Ev: fatura ~%90 ↓, mahsuplaşma, 25 yıl garanti · İşletme: OPEX ↓, amortisman, lisanssız üretim.
3. **GES Çözümleri** — SADECE 5 teklif kartı: Çatı Üstü, Arazi Tipi, Agri-PV, Carport, BESS. (Süreç kartları buradan **çıkar**.)
4. **Nasıl Çalışır (özet)** — 4 adım özet + "Süreci gör" → `/how-it-works`. Ana sayfada tek yerde, kısa.
5. **Hesaplayıcı teaser** — mevcut (özellikle "Evim için" segmentine bağlanır).
6. **Ürünler teaser** — "Sahaya sadece en iyisi girer" başlığıyla 3-4 marka/kategori kartı → `/urunler`.
7. **Elektromekanik şerit** — kompakt tek şerit: "Güneşten fazlası: asansör, VRF, ısı pompası, EV şarj" → `/cozumler/elektromekanik`.
8. **Referanslar** — mevcut testimonial'lar (segment etiketli: villa / işletme).
9. **SSS teaser + Final CTA** — mevcut.

## 5. Hizmetler yeniden yapılanması

### 5.1 GES Çözümleri (müşteri teklifi — Hizmetler'de KALIR)
`rooftop`, `ground`, `agripv`, `carport`, `bess`

### 5.2 Süreç adımları (Hizmetler'den ÇIKAR → Nasıl Çalışır'a taşınır)
Mevcut 4 adımlı `Home.how` şu 6 adıma genişler; çıkarılan 5 hizmet kartı buraya yedirilir:

1. **Ücretsiz Keşif** (mevcut)
2. **Mühendislik & Etüt** (← eski `engineering`: PVsyst, ışınım analizi, saha etüdü)
3. **Proje & Lisanslama** (← eski `licensing`: EPDK, çağrı mektubu)
4. **Tedarik** (← eski `procurement`: panel, inverter, konstrüksiyon)
5. **Kurulum & Devreye Alma** (← eski `construction` + mevcut `install`)
6. **İzleme & Bakım (O&M)** (← eski `om` + mevcut `support`: 7/24 izleme, performans garantisi)

Böylece tekrar ortadan kalkar: Hizmetler = *ne satıyoruz*, Nasıl Çalışır = *nasıl teslim ediyoruz*.

### 5.3 Elektromekanik Çözümler (yeni ikinci sütun — ikincil ağırlık)
- **Asansör Sistemleri** — kurulum, modernizasyon, bakım
- **VRF İklimlendirme** — projelendirme + kurulum
- **Isı Pompası (Heat Pump)** — GES ile kombine "tam elektrifikasyon" çapraz satış açısı
- **EV Şarj İstasyonu** — carport GES ile doğal bağ
> Metin tonu: "Enerjiyi üretiyoruz; binanın onu kullanan sistemlerini de kuruyoruz." GES sayfalarında çapraz linkler (BESS↔heat pump, carport↔EV şarj).
> ⚠️ Kapsam/açıklama metinleri için Olcay'dan hizmet detayı alınmalı (hangi markalar, bakım sözleşmesi var mı vb.).

## 6. Ürünler / Katalog

- **Model:** grup bazlı vitrin. Kategori → Marka → Seri grubu kartı (güç aralığı, hücre tipi, garanti, öne çıkan 3 özellik). Fiyat yok. Kart CTA: "Bu ürünle teklif al" → lead formu (ürün adı hidden field ile gider).
- **Kategoriler (v1):** Güneş Panelleri (37 grup hazır: CW Enerji 12 + TommaTech 25 → `docs/katalog-seed.md`), İnverterler, Bataryalar (BESS), Konstrüksiyon & Montaj, Şarj İstasyonları. Panel dışı kategoriler için marka/ürün listesi Olcay'dan alınacak — v1'de sadece paneller yayınlanabilir.
- **Sanity şeması:** `productCategory` (ad, slug, sıra, ikon) · `productBrand` (ad, logo) · `productGroup` (ad, slug, kategori ref, marka ref, güç aralığı, varyantlar[], garanti, özellikler[], görsel, öne çıkan mı). Görseller kendi Sanity asset'imiz olmalı (cw-enerji.com hotlink **yok**).

## 7. Uygulama fazları (öncelik sırası)

### Faz 1 — Tekrarı kaldır, odağı düzelt (hızlı kazanım) ✅
- [x] `Home.services`: 10 karttan 5 süreç kartını çıkar; intro metnini 5 çözüme göre güncelle
- [x] `Home.how`: 4 → 6 adıma genişlet (5.2'deki içerik taşıma ile), başlığı "Keşiften işletmeye" çakışması giderilecek şekilde ayrıştır
- [x] `/services` ve `/how-it-works` sayfalarını aynı ayrımla güncelle
- [x] tr.json + en.json birlikte (297/297 anahtar paritede)

### Faz 2 — Segmentli giriş ✅
- [x] Hero'ya "Evim için / İşletmem için" ikili CTA
- [x] `/cozumler/evim-icin` ve `/cozumler/isletmem-icin` sayfaları (mevcut ApplicationAreas içeriği bunlara dağılır)
- [x] Nav yeniden yapılanması (3.1) + footer'a Blog/SSS
- [x] Testimonial'lara segment etiketi (mevcut set konut: "Villa sahibi · İzmir" vb. — işletme referansı gerçek içerik gelince eklenecek)

### Faz 3 — Ürünler/Katalog ✅ (kod) · ⏳ (seed + görsel ops)
- [x] Sanity şemaları (6. bölüm) + Studio yapılandırması (`productCategory`, `productBrand`, `productGroup`)
- [x] `katalog-seed.md`'den 37 panel grubu seed scripti (`scripts/seed-products.mjs`, idempotent) — ⏳ `npm run seed:products` bir Sanity write token ile çalıştırılacak; görseller Studio'dan yüklenecek (hotlink yok)
- [x] `/urunler` listeleme + grup kartları + "teklif al" CTA entegrasyonu (lead API'ye + e-postaya ürün alanı; `?urun=` ile taşınır)
- [x] Ana sayfa ürünler teaser'ı (`ProductsTeaser` — "Sahaya sadece en iyisi girer", 4 kategori kartı → `/urunler`)

### Faz 4 — Elektromekanik
- [ ] Olcay'dan kapsam bilgisi (markalar, hizmet detayı) ⛔ blocker
- [ ] `/cozumler/elektromekanik` sayfası + 4 alt hizmet bölümü
- [ ] Ana sayfa elektromekanik şeridi + GES sayfalarında çapraz linkler
- [ ] Nav'a ekleme

### Faz 5 — Cila (kısmi)
- [ ] Hero/genel metinlerin segment diline göre son okuması
- [x] Sitemap `/cozumler/*` + `/urunler` içeriyor; her sayfada `generateMetadata` + alternates — ⏳ OG görselleri + iç link denetimi
- [x] Nasıl Çalışır'a 6 adım ikonu/illüstrasyonu (`public/images/v2/how/` + `public/images/services/*.png` fallback) — elektromekanik ikonları Faz 4 ile

---

*Uygulayacak agent'lara not: i18n anahtarları `messages/tr.json` ve `en.json`'da paralel tutulmalı; Next.js 16 kullanılıyor — koda dokunmadan önce `node_modules/next/dist/docs/` içindeki güncel dokümana bak (AGENTS.md kuralı).*
