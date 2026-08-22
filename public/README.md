# Asset klasörü

`public/` içindeki her dosya site kökünden servis edilir. Örn. `public/logo/minada-mark.svg` → `https://minada.com/logo/minada-mark.svg`. Kodda `/logo/minada-mark.svg` ile referans verilir (başında `/public` yok).

## Nereye ne?

| Klasör | İçerik | İsimlendirme örneği |
|---|---|---|
| `logo/` | Final logo dosyaları (SVG tercih; PNG yedek). Açık ve koyu zemin versiyonları + yalnız sembol. | `minada-logo.svg`, `minada-logo-light.svg` (koyu zeminde), `minada-logo-dark.svg` (açık zeminde), `minada-mark.svg` (sembol) |
| `hero/` | Ana sayfa hero görseli / 3D render / foto. | `hero-home.webp` |
| `services/` | Hizmet görselleri ve ürün (Veichi tarzı) fotoğrafları. | `solar.webp`, `battery.webp`, `ev-charger.webp`, `heat-pump.webp` |
| `projects/` | Tamamlanmış kurulum / referans fotoğrafları. | `proje-izmir-01.webp` |
| `images/` | Genel/diğer görseller (hakkımızda, ekip vb.). | `about-team.webp` |
| `og/` | Sosyal paylaşım (Open Graph) görselleri, 1200×630. | `og-default.jpg` (1200×630; JPEG, çünkü gradyan zemin paletli PNG'de bandlanıyor) |

## App-seviyesi ikonlar (bunlar `public/` değil, `app/` içine)

Next.js bunları dosya adından otomatik alır — `app/` köküne koyun:
- `app/favicon.ico` (var)
- `app/icon.svg` veya `app/icon.png` — modern favicon
- `app/apple-icon.png` — 180×180
- `app/opengraph-image.png` — varsayılan OG (istenirse sonra otomatik üretiriz)

## Format önerileri

- **Logo / ikon:** SVG (ölçeklenir, keskin). Gerekirse `.png` 2x yedek.
- **Fotoğraf:** `.webp` (veya `.avif`); `next/image` otomatik optimize eder.
- **Font:** koda gömülü (`next/font`, Google). Özel marka fontu gelirse `next/font/local` ile eklenir.

## CMS görselleri

Blog / referans görselleri Sanity'den gelecek (Phase 5) — bunlar `public/`'e değil,
Sanity CDN'ine yüklenir (`cdn.sanity.io`, `next.config.ts`'te izinli).

## Not

Roadmap'e göre final logo (SVG/PNG, açık-koyu) ve proje görselleri sizden gelince
`logo/` ve `projects/` altına atın; Logo bileşenini ve galerileri gerçek dosyalara
bağlarım. Şu an logo yer tutucu bir SVG sembol.
