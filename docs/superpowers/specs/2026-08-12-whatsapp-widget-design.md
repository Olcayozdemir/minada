# WhatsApp widget — her sayfada sabit iletişim düğmesi

**Tarih:** 2026-08-12 · **Durum:** Onaylandı (Olcay)
**Kapsam:** Tek yeni client komponent + i18n anahtarları. Yeni bağımlılık yok,
API route yok, çerez yok, dış istek yok.

## Fikir

Sağ altta her sayfada duran dairesel bir WhatsApp düğmesi. Tıklanınca üstünde
küçük bir kart açılıyor; kartta dört iş kolu ve "Diğer" seçeneği var. Seçilen
konu ön-dolu mesaj olarak `wa.me` bağlantısına gidiyor, sohbet ziyaretçinin
kendi WhatsApp'ında açılıyor. MİNADA tarafında hiçbir şey değişmiyor — mesaj
her zamanki hatta düşüyor, telefondan cevaplanıyor.

Bugün WhatsApp bağlantısı yalnızca footer, iletişim sayfası, son CTA ve lead
formunda var; yani ziyaretçi ancak sayfa sonuna inerse görüyor. Bu widget onu
her ekranda sabit bir yere taşıyor. Notion 06.08 listesindeki "Whatsapp hattı
eklenecek, renkli, canlı destek vs." maddesinin karşılığı budur.

## Onaylanan kullanıcı seçimleri

1. **Kendi bileşenimiz, hazır widget değil.** Elfsight/Chaty/Tawk.to elendi.
   Gerekçe: cevaplama WhatsApp'tan yapılacağı için hazır araçların parayla
   sattığı taraf (panel, ziyaretçi takibi, hazır cevaplar) kullanılmadan kalıyor;
   maliyetleri ise gerçek. Sitede şu an **hiç dış script yok** ve çerez onay
   banner'ı da yok — dış widget, KVKK için ayrıca banner işi açardı.
2. **Cevaplama telefondan, WhatsApp'tan.** Site içi sohbet paneli, mesai saati
   kuralı ve offline mesaj formu yok.
3. **Renk: WhatsApp yeşili (#25D366).** Sitenin navy/gold paletine bilinçli
   istisna. Gerekçe: bu düğmenin tek işi bir saniyede tanınmak. Yeşil yalnızca
   bu düğmede kullanılır, başka hiçbir UI öğesine sızmaz.

## Kapsam dışı (bilerek)

- Widget içinde serbest metin kutusu — WhatsApp'ın kendi giriş alanını kopyalar.
- "Yazıyor…" animasyonu ve sahte çevrimiçi rozeti — karşıda kimse yokken yalan.
- İlk ziyarette kendiliğinden açılan balon.
- Çalışma saati kuralı, cevap süresi vaadi ("5 dakikada dönüyoruz" gibi).
- Hesaplayıcı sonucunu mesaja gömmek — hesaplayıcının kendi CTA'sı zaten var.

## Mimari

- **Yeni:** `components/layout/WhatsAppWidget.tsx` (client) + `.module.scss`.
- Mount noktası: `app/[locale]/(marketing)/layout.tsx`, `<Footer />` sonrası.
  Studio bu layout'un dışında olduğu için orada çıkmaz.
- `next/dynamic` kullanılmıyor: bileşen birkaç KB, `position:fixed` olduğu için
  CLS riski yok; kod bölme bu boyutta kazanç değil karmaşa getirir.
- Bağlantı üretimi mevcut `whatsappLink(message?)` (lib/site.ts) ile. Numara
  zaten `NEXT_PUBLIC_WHATSAPP_NUMBER` ile override edilebiliyor, dokunulmuyor.

### Durum

Tek bir `open` boolean. Kapalıyken sadece düğme, açıkken düğme + kart.

### Konu listesi

Kaynak `BUSINESS_LINES` (lib/site.ts) — id sırası görüntü sırası: `ges`, `bess`,
`heatpump`, `evcharge`. Etiketler `Nav.line_<id>` anahtarlarından okunur, yani
menüdeki adlar değişirse widget kendiliğinden aynı adı gösterir. Listeye son
öğe olarak "Diğer" eklenir.

**Sayfa bağlamı:** `usePathname()` (i18n/navigation) kanonik yolu döndürür —
`BUSINESS_LINES[].href` de kanonik yol tutar, yani karşılaştırma birebir string
eşitliği. Eşleşen iş kolu listenin başına alınır; eşleşme yoksa liste tanımlı
sırasında kalır. Başka bağlantı, state paylaşımı veya prop geçişi yok.

### Mesaj

`WhatsAppWidget.message` şablonu: `"Merhaba, {topic} hakkında bilgi almak
istiyorum."` — mevcut `LeadForm.productMessage` kalıbıyla aynı biçim. "Diğer"
seçilirse mesajsız `whatsappLink()` çağrılır, ziyaretçi kendi yazar.

Bağlantılar `target="_blank" rel="noopener noreferrer"`.

### Katman

`z-index: 90`. Header 100, mobil çekmece overlay'i 150 / içeriği 151. Böylece
çekmece açıkken widget'ın üstünü örter; header'la zaten çakışmıyor (biri üstte,
biri altta).

## Yerleşim

- Masaüstü: sağ alt, kenarlardan 24px. Düğme 56px.
- Mobil: sağ alt, kenarlardan 16px, alt boşluğa `env(safe-area-inset-bottom)`
  eklenir. Düğme 52px.
- Kart: düğmenin üstünde, genişlik 320px; mobilde `min(320px, 100vw - 32px)`.

## Erişilebilirlik

- Düğme bir disclosure: `aria-expanded`, `aria-controls`, `aria-label` =
  `WhatsAppWidget.title`.
- Escape kartı kapatır; dışına tıklamak kapatır.
- Açılınca odak kartın içine (ilk konu düğmesine), kapanınca tetikleyici
  düğmeye döner.
- **Modal değil:** odak hapsi ve scroll kilidi yok. Küçük bir popover için
  ikisi de saldırgan olur ve sayfayı gezmeyi engeller.
- Kart açıkken sayfanın geri kalanı `aria-hidden` yapılmaz.

## Hareket

Açılış/kapanış ayrık bir durum değişimi olduğu için küçük bir yay hissi:
opacity + hafif scale/translate, ~180ms. `prefers-reduced-motion: reduce`
altında yalnızca opacity geçişi kalır — hareket kaldırılır ama geri bildirim
öldürülmez.

## i18n

`messages/tr.json` ve `messages/en.json` içine yeni `WhatsAppWidget` alanı:

| Anahtar | TR | EN |
|---|---|---|
| `title` | WhatsApp'tan yazın | Message us on WhatsApp |
| `close` | Kapat | Close |
| `prompt` | Hangi konuda yardımcı olalım? | What can we help you with? |
| `other` | Diğer | Something else |
| `message` | Merhaba, {topic} hakkında bilgi almak istiyorum. | Hello, I'd like information about {topic}. |

`title` iki yerde kullanılır: kapalı düğmenin `aria-label`'ı ve açık kartın
başlığı. İkisi aynı cümle olduğu için ayrı anahtar tutulmadı.

Konu adları ayrıca tanımlanmaz, `Nav.line_*` yeniden kullanılır.

## Kenar durumlar

- **WhatsApp kurulu değil:** `wa.me` masaüstünde WhatsApp Web'e düşürür, ek iş yok.
- **Mobil menü açık:** çekmece overlay'i widget'ı örter (z-index).
- **Yazdırma:** `@media print` altında gizlenir.
- **İletişim sayfası:** widget orada da görünür. Sabit bir aracın değeri her
  sayfada aynı yerde olmasından geliyor; sayfaya özel istisna konmadı.

## Doğrulama

Dev sunucuda, hem `/tr` hem `/en` üzerinde:

1. Düğme sağ altta duruyor, kart açılıp kapanıyor.
2. Her konu için üretilen `wa.me` bağlantısı doğru numarayı ve doğru ön-dolu
   metni taşıyor (TR ve EN ayrı ayrı kontrol).
3. EV şarj sayfasında EV şarj konusu listenin başında.
4. Mobil (375px) ve masaüstü (1280px) yerleşimi; mobil menü açıkken widget
   görünmüyor.
5. Klavye: Tab ile düğmeye ulaşılıyor, Enter açıyor, Escape kapatıyor, odak
   düğmeye geri dönüyor.
6. `prefers-reduced-motion` açıkken kart hareketsiz açılıyor ama görünüyor.
