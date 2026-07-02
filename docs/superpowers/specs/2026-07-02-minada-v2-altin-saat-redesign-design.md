# MİNADA v2 Redesign — "Altın Saat" (Golden Hour)

**Tarih:** 2026-07-02 · **Durum:** Onaylandı (Olcay)
**Kapsam:** Ana sayfa komple (hero + tüm bölümler + header/footer) — iç sayfalar sonraki faz.

## Problem

Mevcut tasarım (v1, "Liman Işığı"): düz lacivert zemin üzerinde yüzen 3D ev kesiti,
standart split-hero, küçük stat kartları. Kullanıcı sonucu sevmedi. Paylaşılan 4 referans
(Seative, Creaenergy, SunVault, akıllı-ev render) ortak bir dili işaret ediyor:
sinematik fotoğraf, ekranı kaplayan dev display tipografi, fotoğraf üstü cam rozetler,
büyük yuvarlatılmış kartlı ferah bölümler.

## Onaylanan yön (kullanıcı seçimleri)

1. **Genel ton:** Sinematik foto hero + **açık gövde** (Seative/Creaenergy ailesi).
2. **Hero tipografisi:** Dev display kelimeler, görselle iç içe/katmanlı.
3. **Görsel kaynağı:** Unsplash'ten ücretsiz lisanslı fotoğraflar (Claude indirir, doğrular).
4. **Kapsam:** Ana sayfa komple; onay sonrası iç sayfalara yayılır.

## Sabit marka kısıtları (değişmez)

- Palet: navy `#0F2A4A` ailesi + altın `#F2A82C` (logo: lacivert çift-M + altın panel çizgisi).
  Referanslardaki lime yeşili KULLANILMAZ → altın onun yerini alır. Cyan yalnızca mevcut
  3D ev kesitinin kendi çizgilerinde kalabilir (atmosferik, onaylı).
- Tipografi: Bricolage Grotesque (başlık/display) + Fraunces italik (vurgu) + Manrope (gövde).
- TR/EN tam iki dilli (next-intl), mevcut route/i18n/Sanity yapısına dokunulmaz.
- Stack: Next.js 16 App Router, SCSS Modules, Radix. Tailwind yok.

## Tasarım

### Hero ("Altın Saat" vitrini)
- Tam ekran ~95svh, full-bleed golden-hour fotoğraf (tepeler/çatılar + güneş panelleri,
  sıcak gökyüzü). Alttan yukarı lacivert degrade scrim (okunabilirlik + gövdeye geçiş).
- Dev display: TR `GÜNEŞ / ENERJİSİ`, EN `SOLAR / POWER` — Bricolage, clamp(~3.5rem → 12vw),
  beyaz, iki satır hafif merdivenli. Kelimeler arasına logodaki altın panel-çizgisi glifi
  (SVG, eğik paralelkenar segmentler) — SunVault'un ⚡'ı gibi ama markaya ait.
- Katman sırası: fotoğraf → scrim → display tipo → **3D ev kesiti** (public/hero/hero-home.png)
  alt-merkezde tipoya taşarak önde. Ev kesiti sıcak fotoğrafla çatışırsa yedek plan:
  kesitsiz, salt foto + tipo (Creaenergy kompozisyonu). Karar ekran görüntüsüyle verilecek.
- Fotoğraf üstü cam rozetler (mevcut glass mixin + SVG filter):
  - `%90'a varan fatura tasarrufu` — altın progress halkası
  - `10 yıl garanti & servis`
  - Sağ altta hesaplayıcıya giden mini cam kart (foto thumb + "Tasarrufunu hesapla →")
- Üstte küçük tagline: "Enerji dönüşümü yolculuğunuzda güvenilir bir liman." — Fraunces
  italik, "liman" altın.
- CTA: altın pill `Ücretsiz keşif` + cam ghost `Tasarrufumu hesapla →`.
- Mevcut 4'lü stat halka şeridi hero'dan kalkar (rozetlere dağılır).

### Header
Yüzen cam pill nav (Creaenergy): solda logo, ortada linkler, sağda TR/EN + altın CTA.
Hero üstünde açık-cam (beyaz metin); scroll sonrası açık zeminde koyu metinli kompakt cam.
Mobil: mevcut Radix Dialog menü, yeni stile giydirilir.

### Gövde (açık `#F5F7FB` zemin, beyaz kartlar, radius 24–28px, bol beyaz alan)
Sıra ve kalıplar:
1. **Tanıtım** — karışık vurgulu büyük paragraf (lacivert kalın → gri devam, Fraunces
   italik dokunuş), yanda 2-3'lü küçük foto yığını + memnuniyet çipi. (Creaenergy "who we are")
2. **Hizmetler** — sayfanın TEK koyu lacivert bandı (kontrast vuruşu). 4 hizmet
   (Güneş / EV Şarj / Batarya / Isı Pompası): büyük fotoğraflı kartlar, ikon çipi,
   kısa açıklama, ok butonu. Mobilde yatay kaydırma.
3. **Nasıl Çalışır** — açık zemin, 4 numaralı adım kartı (keşif → tasarım → kurulum →
   izleme), ince altın bağlantı çizgisi.
4. **Uygulama Alanları** — 4 foto karo (konut / ticari / tarım / kamu), cam etiket overlay.
   (Seative alt sırası)
5. **Hesaplayıcı teaser** — split: solda başlık + ✓ maddeler + CTA, sağda büyük foto kart
   üstünde cam tasarruf-göstergesi rozeti (Seative "700kV" çipi kalıbı).
6. **Referanslar** — beyaz kartlar, yıldız, sade grid.
7. **SSS** — temiz akordeon, beyaz.
8. **Final CTA** — full-width alacakaranlık panel fotoğrafı bandı + ortada cam kart
   ("Güneşiniz boşa parlamasın") + form CTA.
9. **Footer** — lacivert, arkada dev hayalet MİNADA wordmark, kolonlar.

### Sistem değişiklikleri
- **tokens.css:** açık tema semantiği eklenir — `--bg` açık, `--surface` beyaz,
  `--ink` metin; navy skala koyu bant/footer/scrim için kalır; altın aynen
  (açık zeminde metin olarak AA için `--gold-600`/`--gold-700`). Yeni: `--r-xl: 28px`,
  `--fs-display` clamp'i, büyüyen başlık ölçeği.
- **Cam:** fotoğraf üstü rozet/etiketlerde kalır (orada parlar); beyaz kartlar cam DEĞİL —
  yumuşak gölge + ince kenar (`1px rgba(navy, .08)`).
- **Butonlar:** pill; altın primary (ok-daire motifi), navy ghost secondary; foto üstünde
  cam ghost.
- **Bileşenler:** mevcut yapı korunur (Hero, Services, HowItWorks, ApplicationAreas,
  CalculatorTeaser, Testimonials, FaqTeaser, FinalCta, Header, Footer, Section,
  SectionHeading, Button) — SCSS'leri ve iç markup'ları yeniden giydirilir. Route, i18n
  mekaniği, form/hesaplayıcı mantığı, Sanity, SEO değişmez; yalnız yeni çeviri anahtarları
  eklenir (TR/EN birlikte).

### Görseller (Unsplash, indirilip repoya konur)
11 adet, `public/images/` altına anlamlı adlarla; her indirme sonrası dosya doğrulanır
(gerçek görüntü mü, çözünürlük yeterli mi, üzerinde bozuk metin yok mu):
hero ×1 (geniş, golden-hour solar manzara), hizmet ×4 (çatı GES, EV şarj, batarya/powerwall,
ısı pompası — bulunamazsa en yakın kaliteli alternatif), uygulama alanı ×4 (konut, ticari
çatı, tarımsal GES, kamu binası), hesaplayıcı ×1, final CTA bandı ×1. Beğenilmeyenler
sonradan tek tek değiştirilebilir; ileride müşteri fotoğraflarıyla swap edilecek şekilde
`next/image` + sabit isimlendirme.

### Performans / erişilebilirlik
- Hero fotoğrafı = LCP: `next/image` `priority`, uygun `sizes`, makul kalite; display
  tipo sistem-yüklü fontla FOUT'suz (`next/font` zaten var).
- Scrim ile foto üstü metinlerde AA kontrast; cam rozetlerde metin arkasına tint.
- `prefers-reduced-motion`: parallax/marquee/halka animasyonları kapanır.
- Mobil: display tipo vw-clamp, ev kesiti küçülür, rozetler stack/gizlenir, hizmetler
  yatay kaydırma.

## Yapılmayacaklar (YAGNI)
- İç sayfa redesign'ları (sonraki faz), yeni route, yeni form alanı, CMS şema değişikliği,
  scroll-jacking/ağır animasyon kütüphanesi, Tailwind'e geçiş, lime yeşili.

## Riskler / kararlar
- **Ev kesiti vs salt foto:** ekran görüntüsüyle karar; ikisi de spec'e uygun.
- **Unsplash'te ısı pompası görseli zayıf olabilir** → en yakın kaliteli alternatif + not.
- **Origin senkronu:** bu oturumda GitHub auth yok; memory'ye göre origin'de lokalde
  olmayan bir Vercel-fix commit'i olabilir. Push öncesi `git pull` şart (kullanıcı).

## Başarı ölçütü
Ana sayfa TR+EN'de yeni dille SSG-green build + lint temiz; hero ve tüm bölümler
referanslardaki hissi verir (kullanıcı ekran görüntüleriyle onaylar); Lighthouse
LCP/contrast'ta bariz gerileme yok.
