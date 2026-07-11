# "5 Kapı" İA + Kamp/Taşınabilir Güç + Tasarım Dili — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Birincil navigasyonu iş kolu bazlı "5 kapı"ya (GES · Depolama · Isı Pompası · EV Şarj · Kamp) çevir; Anker SOLIX kamp ürünleriyle "Taşınabilir Güç" katalog kategorisi + kamp landing'i aç; lit-stage tasarım imzasını ortak parçaya çıkarıp yay; lead formuna konu alanı + gerçek iletişim bilgisi ekle.

**Architecture:** Spec: `docs/superpowers/specs/2026-07-11-bes-kapi-ia-kamp-design.md`. Mevcut kalıplar korunur: next-intl localized pathnames + SSG, statik katalog (`lib/catalog-data.ts`) → Sanity seed, Section/SectionHeading/Button/CategoryGrid primitifleri, SCSS Modules. Yeni sayfalar mevcut segment sayfası kalıbını klonlar.

**Tech Stack:** Next.js 16 (App Router, Turbopack), next-intl v4, SCSS Modules, Sanity, Zod v4 + RHF, Resend.

**Doğrulama modeli (bu repo'da test framework'ü yok — kurmuyoruz, YAGNI):** her görevin "test" adımı = `npm run build` (her iki locale SSG yeşil) + `npx eslint .` + i18n anahtar paritesi scripti + görsel kontrol (preview). Build, `setRequestLocale` eksiği / kırık `Link` pathname'i / eksik mesaj anahtarında zaten kırılır — güvenlik ağı budur.

**İ18n parite komutu (birden çok görevde kullanılır):**
```bash
python3 -c "
import json
def keys(d, p=''):
    out=set()
    for k,v in d.items():
        kk=f'{p}.{k}' if p else k
        out |= keys(v,kk) if isinstance(v,dict) else {kk}
    return out
tr=keys(json.load(open('messages/tr.json'))); en=keys(json.load(open('messages/en.json')))
print('sadece tr:', sorted(tr-en)[:20] or 'YOK'); print('sadece en:', sorted(en-tr)[:20] or 'YOK')"
```
Beklenen: iki satır da `YOK`.

**Genel kurallar:**
- Her görev sonunda odaklı commit: `git add <tam yollar>` (asla `git add -A` — paralel oturum riski).
- Yeni page/layout'ta `setRequestLocale(locale)` + `generateMetadata`(+`buildAlternates`) şart.
- Yeni bir Next API'sine dokunmadan önce `node_modules/next/dist/docs/` ilgili dokümana bak (AGENTS.md). Bu plandaki kod mevcut, çalışan kalıpların klonu olduğundan yeni API yok.
- `npm run build` çalıştırmadan önce başka `next dev` kilidi varsa (`.next/dev` lock hatası) süreci öldür: hata çıktısındaki `kill <pid>`.

---

## Task 1: Routing + site.ts — 5 yeni rota ve iş kolu sabitleri

**Files:**
- Modify: `i18n/routing.ts`
- Modify: `lib/site.ts`
- Modify: `app/sitemap.ts`

- [ ] **Step 1.1: routing.ts'e 5 pathname ekle** — `"/cozumler/isletmem-icin"` satırının altına:

```ts
    "/cozumler/kamp-outdoor": { tr: "/cozumler/kamp-outdoor", en: "/solutions/camping-outdoor" },
    "/hizmetler/gunes-enerjisi": { tr: "/hizmetler/gunes-enerjisi", en: "/services/solar-energy" },
    "/hizmetler/enerji-depolama": { tr: "/hizmetler/enerji-depolama", en: "/services/energy-storage" },
    "/hizmetler/isi-pompasi": { tr: "/hizmetler/isi-pompasi", en: "/services/heat-pump" },
    "/hizmetler/ev-sarj": { tr: "/hizmetler/ev-sarj", en: "/services/ev-charging" },
```

- [ ] **Step 1.2: lib/site.ts'i yeniden yapılandır** — `NavItem` tipi iki sütunlu grubu öğrenir, `SERVICES` GES tiplerine daralır, `BUSINESS_LINES` doğar, telefon/Instagram gerçek değerlere döner (Okan onaylı). Dosyanın tamamı şu hale gelir:

```ts
import type { StaticPathname } from "@/i18n/routing";

// Primary navigation. `key` maps to the `Nav` message namespace; `href` is the
// canonical (localized) route from i18n/routing. An item with `columns`
// renders as a two-column mega dropdown (no href of its own).
export type NavLink = { href: StaticPathname; key: string };
export type NavColumn = { key: string; children: readonly NavLink[] };
export type NavItem = NavLink | { key: string; columns: readonly NavColumn[] };

// The four business lines (order = display order). `href` reused by nav+footer.
export const BUSINESS_LINES = [
  { id: "ges", href: "/hizmetler/gunes-enerjisi" },
  { id: "bess", href: "/hizmetler/enerji-depolama" },
  { id: "heatpump", href: "/hizmetler/isi-pompasi" },
  { id: "evcharge", href: "/hizmetler/ev-sarj" },
] as const satisfies ReadonlyArray<{ id: string; href: StaticPathname }>;

// Audience/use-case entries ("Sizin için").
export const AUDIENCES = [
  { id: "solutionsHome", href: "/cozumler/evim-icin" },
  { id: "solutionsBusiness", href: "/cozumler/isletmem-icin" },
  { id: "solutionsCamp", href: "/cozumler/kamp-outdoor" },
] as const satisfies ReadonlyArray<{ id: string; href: StaticPathname }>;

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    key: "solutionsGroup",
    columns: [
      {
        key: "navColLines",
        children: BUSINESS_LINES.map((l) => ({ href: l.href, key: `line_${l.id}` })),
      },
      {
        key: "navColFor",
        children: AUDIENCES.map((a) => ({ href: a.href, key: a.id })),
      },
    ],
  },
  { href: "/urunler", key: "products" },
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/calculator", key: "calculator" },
  { href: "/about", key: "about" },
];

// GES offer types — live on /hizmetler/gunes-enerjisi (BESS is its own line now).
export const GES_TYPES = ["rooftop", "ground", "agripv", "carport"] as const;

// Contact + social. Phone + Instagram are real (Okan, 2026-07-11); email waits
// for the domain. WhatsApp number is read from env when available.
export const SITE = {
  name: "MİNADA",
  domain: "minada.com",
  email: "info@minada.com",
  phone: "+90 536 041 76 44",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905360417644",
  social: {
    instagram: "https://instagram.com/minadaenerji",
    linkedin: "https://linkedin.com/",
  },
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
```

Not: `NavLink.key` iş kolları için `line_ges` biçiminde — Nav mesaj alanında düz anahtar olarak durur.
`SERVICES` sabitini kullanan yerler bu görev bitmeden kırılır (Footer) — Task 2'de düzelecek; build'i Task 2 sonunda alacağız.

- [ ] **Step 1.3: sitemap HREFS'e 5 rota ekle** — `app/sitemap.ts` içindeki `HREFS` dizisine `"/cozumler/isletmem-icin"` satırından sonra:

```ts
  "/cozumler/kamp-outdoor",
  "/hizmetler/gunes-enerjisi",
  "/hizmetler/enerji-depolama",
  "/hizmetler/isi-pompasi",
  "/hizmetler/ev-sarj",
```

- [ ] **Step 1.4: Commit etme — Task 2 ile birlikte** (Footer henüz `SERVICES` import ediyor; kırık ara durum commit'lenmez).

## Task 2: Nav (mega dropdown) + MobileNav + Footer + Hero CTA + mesajlar

**Files:**
- Modify: `components/layout/Header.tsx`, `components/layout/Header.module.scss`
- Modify: `components/layout/MobileNav.tsx`
- Modify: `components/layout/Footer.tsx`
- Modify: `components/marketing/Hero.tsx`
- Modify: `messages/tr.json`, `messages/en.json`

- [ ] **Step 2.1: Nav mesajları** — `messages/tr.json` `Nav` nesnesine ekle (mevcut anahtarlar kalır):

```json
"navColLines": "İş kollarımız",
"navColFor": "Sizin için",
"line_ges": "Güneş Enerjisi (GES)",
"line_bess": "Enerji Depolama",
"line_heatpump": "Isı Pompası",
"line_evcharge": "EV Şarj İstasyonları",
"solutionsCamp": "Kamp & Outdoor"
```

`messages/en.json` `Nav`:

```json
"navColLines": "What we do",
"navColFor": "For you",
"line_ges": "Solar Energy (PV)",
"line_bess": "Energy Storage",
"line_heatpump": "Heat Pumps",
"line_evcharge": "EV Charging",
"solutionsCamp": "Camping & Outdoor"
```

- [ ] **Step 2.2: Header.tsx — columns render** — `NAV_ITEMS.map` içindeki `"children" in i` dalını `"columns" in i` ile değiştir; flatItems da columns'tan düzleşir:

```tsx
  const flatItems = NAV_ITEMS.flatMap((i) =>
    "columns" in i
      ? i.columns.flatMap((col) => col.children.map((c) => ({ href: c.href, label: t(c.key) })))
      : [{ href: i.href, label: t(i.key) }],
  );
```

Dropdown JSX (mevcut `<div className={styles.dropdown}>` bloğunun yerine):

```tsx
                    <div className={styles.dropdown}>
                      {i.columns.map((col) => (
                        <div key={col.key} className={styles.dropCol}>
                          <span className={styles.dropColTitle}>{t(col.key)}</span>
                          {col.children.map((c) => (
                            <Link key={c.href} href={c.href} className={styles.dropLink}>
                              {t(c.key)}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
```

(map callback'inde `"children" in i` yerine `"columns" in i` koşulunu kullan.)

- [ ] **Step 2.3: Header.module.scss — iki sütun** — mevcut `.dropdown` kuralına genişlik/grid ekle, sütun başlığı stili yeni:

```scss
.dropdown {
  /* mevcut konumlandırma/glass kuralları kalır; şunlar eklenir/güncellenir: */
  display: grid;
  grid-template-columns: auto auto;
  gap: var(--space-5);
  min-width: 460px;
  padding: var(--space-4) var(--space-5);
}

.dropCol {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 180px;
}

.dropColTitle {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--gold-600);
  margin-bottom: var(--space-2);
  white-space: nowrap;
}
```

Mevcut `.dropdown`daki `flex-direction: column` benzeri satırlar grid ile çelişiyorsa kaldırılır; `.dropLink` aynı kalır. Hover/focus açılma mekanizması değişmez.

- [ ] **Step 2.4: MobileNav başlıklı bölümler** — düz numaralı liste 12 linke çıkacağı için iki başlık eklenir. `MobileNav`a mevcut `items` yerine `groups` prop'u:

```tsx
type Item = { href: StaticPathname; label: string };
type Group = { title?: string; items: Item[] };

export function MobileNav({
  groups,
  cta,
  menuLabel,
  closeLabel,
}: {
  groups: Group[];
  cta: string;
  menuLabel: string;
  closeLabel: string;
}) {
```

nav gövdesi (numara sayacı gruplar arasında devam eder):

```tsx
          <nav className={styles.nav} aria-label="Primary">
            {(() => {
              let n = 0;
              return groups.map((g, gi) => (
                <div key={gi} className={styles.group}>
                  {g.title ? <span className={styles.groupTitle}>{g.title}</span> : null}
                  {g.items.map((i) => {
                    n += 1;
                    return (
                      <Link key={i.href} href={i.href} className={styles.link} onClick={() => setOpen(false)}>
                        <span className={styles.linkNum}>{String(n).padStart(2, "0")}</span>
                        {i.label}
                        <IconArrowRight size={17} className={styles.linkArrow} />
                      </Link>
                    );
                  })}
                </div>
              ));
            })()}
          </nav>
```

`MobileNav.module.scss`e ekle:

```scss
.group {
  display: contents; /* linkler mevcut akışta kalır */
}

.groupTitle {
  display: block;
  margin: var(--space-4) 0 var(--space-2);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--gold-600);
}
```

Not: `display: contents` + block başlık birlikte çalışır; görsel kontrolde bozuksa `.group{display:block}` yap.

- [ ] **Step 2.5: Header.tsx — MobileNav'a groups geç** — `flatItems` yerine:

```tsx
  const mobileGroups = [
    {
      title: t("navColLines"),
      items: NAV_ITEMS.flatMap((i) =>
        "columns" in i && i.columns[0]
          ? i.columns[0].children.map((c) => ({ href: c.href, label: t(c.key) }))
          : [],
      ),
    },
    {
      title: t("navColFor"),
      items: NAV_ITEMS.flatMap((i) =>
        "columns" in i && i.columns[1]
          ? i.columns[1].children.map((c) => ({ href: c.href, label: t(c.key) }))
          : [],
      ),
    },
    {
      items: NAV_ITEMS.flatMap((i) => ("columns" in i ? [] : [{ href: i.href, label: t(i.key) }])),
    },
  ];
```

ve `<MobileNav groups={mobileGroups} … />`. (Önceki `flatItems` tanımı silinir — Step 2.2'de yazılmıştı, bu adımda yerini `mobileGroups` alır.)

- [ ] **Step 2.6: Footer — iki link sütunu** — `Footer.tsx`te `SERVICES` importu `BUSINESS_LINES, AUDIENCES` olur; hizmetler sütunu şu hale gelir (Şirket sütunu aynen kalır):

```tsx
          <nav className={styles.col} aria-label={t("linesTitle")}>
            <h3 className={styles.colTitle}>{t("linesTitle")}</h3>
            {BUSINESS_LINES.map((l) => (
              <Link key={l.id} href={l.href} className={styles.colLink}>
                {tn(`line_${l.id}`)}
              </Link>
            ))}
          </nav>

          <nav className={styles.col} aria-label={t("forYouTitle")}>
            <h3 className={styles.colTitle}>{t("forYouTitle")}</h3>
            {AUDIENCES.map((a) => (
              <Link key={a.id} href={a.href} className={styles.colLink}>
                {tn(a.id)}
              </Link>
            ))}
          </nav>
```

`ts` (Services çevirisi) importu ve `getTranslations("Services")` satırı silinir. Footer grid'i 4→5 sütuna çıkıyor; `Footer.module.scss` `.top` grid'ine bir sütun ekle (mevcut kolon şablonunu bul, `brandCol + 2 nav + contact` → `brandCol + 3 nav + contact`; dar ekran kırılımları zaten wrap ediyorsa dokunma).

Footer mesajları — tr `Footer`: `"linesTitle": "İş kollarımız", "forYouTitle": "Sizin için"`; en: `"linesTitle": "What we do", "forYouTitle": "For you"`. Eski `servicesTitle` anahtarı iki dilden de silinir. `placeholderNote` içeriği tr: `"E-posta adresi domain kurulumuyla birlikte aktifleşecek."` en: `"Email goes live together with the domain setup."` (telefon artık gerçek — not sadece e-postayı kapsar).

- [ ] **Step 2.7: Hero CTA** — `Hero.tsx` actions bloğu şu olur:

```tsx
            <div className={styles.actions}>
              <Button href="/contact" size="lg" withArrow>
                {tc("getQuote")}
              </Button>
              <Button externalHref="#cozumler" newTab={false} size="lg" variant="glass">
                {t("ctaSolutions")}
              </Button>
            </div>
```

Mesajlar — tr `Hero`: `"ctaSolutions": "Çözümlerimiz"`; en `Hero`: `"ctaSolutions": "Our solutions"`. tr+en'den `segmentHome`/`segmentBusiness` anahtarları silinir.

- [ ] **Step 2.8: Doğrulama** — Task 3'te Services bandı `id="cozumler"` alacak; şimdilik anchor boşa gider, sorun değil (build kırmaz). Çalıştır:

```bash
npx eslint . && npm run build
```

Beklenen: exit 0, her iki locale SSG. Yeni rotalar henüz sayfasız — routing'e eklenen pathname'ler app dizini olmadan build'i KIRAR (`/hizmetler/gunes-enerjisi` için page yok). Bu yüzden bu adımda build kırılırsa Task 5'teki 4 sayfa + Task 4 landing stub'ları önce açılmalı. Pratik sıra: Step 2.8'i atla, Task 4-5 stub'ları gelene kadar build'i erteleme yerine **hemen şimdi 5 sayfanın iskeletini aç** (bir sonraki adım).

- [ ] **Step 2.9: 5 rota için iskelet sayfalar** — içerik görevleri (4-5) dolduracak; şimdilik derlenen minimal sayfa. Beş dizin: `app/[locale]/(marketing)/hizmetler/{gunes-enerjisi,enerji-depolama,isi-pompasi,ev-sarj}/page.tsx` + `app/[locale]/(marketing)/cozumler/kamp-outdoor/page.tsx`. Hepsi aynı şablon (örnek `gunes-enerjisi`; diğerlerinde yalnız pathname + namespace değişir — namespace'ler: `Lines.ges`, `Lines.bess`, `Lines.heatpump`, `Lines.evcharge`, `Segments.camp`):

```tsx
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PlaceholderPage } from "@/components/marketing/PlaceholderPage";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Lines.ges" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/hizmetler/gunes-enerjisi", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lines.ges");
  return <PlaceholderPage title={t("title")} />;
}
```

(`PlaceholderPage`ın prop imzasını dosyadan doğrula — stub'ları mevcut kullanım örneğine göre uydur.) Mesajlara beş namespace için minimum `metaTitle`, `metaDesc`, `title` ekle — tam içerik Task 4/5'te genişler. tr örneği:

```json
"Lines": {
  "ges": { "metaTitle": "Güneş Enerjisi (GES)", "metaDesc": "Çatı, arazi, tarımsal ve carport GES çözümleri.", "title": "Güneş Enerjisi (GES)" },
  "bess": { "metaTitle": "Enerji Depolama (BESS)", "metaDesc": "Ev tipi ve ticari enerji depolama sistemleri.", "title": "Enerji Depolama" },
  "heatpump": { "metaTitle": "Isı Pompası", "metaDesc": "Isıtma, soğutma, sıcak su ve havuz ısı pompaları.", "title": "Isı Pompası" },
  "evcharge": { "metaTitle": "EV Şarj İstasyonları", "metaDesc": "Ev ve işletmeler için AC/DC şarj çözümleri.", "title": "EV Şarj İstasyonları" }
},
"Segments": { "...mevcut home/business kalır...", "camp": { "metaTitle": "Kamp & Outdoor", "metaDesc": "Kamp, karavan ve tekne için taşınabilir güç çözümleri.", "title": "Kamp & Outdoor" } }
```

en karşılıkları: `Solar Energy (PV)` / `Energy Storage (BESS)` / `Heat Pumps` / `EV Charging` / `Camping & Outdoor` başlıklarıyla aynı yapı.

- [ ] **Step 2.10: Build + parite + commit**

```bash
npx eslint . && npm run build   # beklenen: yeşil, tüm yeni rotalar SSG listede
# i18n parite komutu (plan başında) → iki satır YOK
git add i18n/routing.ts lib/site.ts app/sitemap.ts components/layout/ components/marketing/Hero.tsx "app/[locale]/(marketing)/hizmetler" "app/[locale]/(marketing)/cozumler/kamp-outdoor" messages/
git commit -m "nav: iş kolu bazlı '5 kapı' İA — mega dropdown, footer sütunları, hero CTA, rota iskeletleri"
```

## Task 3: Katalog — "Taşınabilir Güç" kategorisi (veri + görseller + seed)

**Files:**
- Modify: `lib/catalog-data.ts`
- Modify: `components/marketing/CategoryGrid.tsx` (CAT_HERO)
- Create: `public/products/portable/*.{jpg,webp,png}` (indirilen ürün fotoğrafları)
- Create: `public/images/products/portable-power.png` (kategori tile görseli)
- Modify: `messages/tr.json`, `messages/en.json` (Products)

- [ ] **Step 3.1: Anker ürün sayfalarını gez, spec + görsel URL'lerini topla.** Kaynak sayfalar:

```text
https://www.ankersolixtr.com/urun/anker-solix-c300x-dc-288-wh-300w-a1723-20337
https://www.ankersolixtr.com/urun/anker-solix-c1000x-1056wh-1800w-a1761-20232
https://www.ankersolixtr.com/urun/anker-solix-c1000x-gen2-1024wh-2000w-a1763anker-solix-c1000x-gen2-1024wh-2000w-a1763
https://www.ankersolixtr.com/urun/anker-solix-f1500-1536wh-1800w-a1772-20233
https://www.ankersolixtr.com/urun/anker-powerhouse-767-tasinabilir-guc-kaynagi-2048wh-2400w-ev-karavan-ve-dis-mekan-kullanimi-icin-lifepo4-pilli-jenerator-a1780-anker-turkiye-garantili-18685
https://www.ankersolixtr.com/urun/anker-solix-solar-panel-200w-a2436-20234
https://www.ankersolixtr.com/urun/anker-solix-solar-panel-400w-a2437-20432
https://www.ankersolixtr.com/urun/anker-powered-cooler-43l-a17a1anker-powered-cooler-43l-a17a1
```

+ site içi arama/kategori sayfasından **C300 DC** ve **C2000 Gen 2** ürün URL'leri bulunur (ana sayfada listeleniyordu). Her sayfadan: ana ürün görseli URL'i (og:image veya galeri ilk görsel) + Wh/W teyidi + 2-3 özellik. `curl -sL <url> | grep -o 'og:image[^>]*'` yeterli; görselleri `curl -o public/products/portable/<slug>.jpg <img-url>` ile indir. Hedef adlandırma:

```text
c300-dc.jpg  c300x.jpg  c1000x.jpg  c1000-gen2.jpg  c2000-gen2.jpg
f1500.jpg  767-powerhouse.jpg  ps200.jpg  ps400.jpg  everfrost.jpg
```

İndirme sonrası hepsini kontrol et: `ls -la public/products/portable/` — 10 dosya, her biri > 10KB (bozuk/boş inmediğinden emin ol). 200KB üstü olanları sıkıştır (mevcut katalog görselleri gibi — `sips -Z 1000` yeterli).

- [ ] **Step 3.2: TommaTech Easy Life görselleri** — tommatech.de / tommatech.com.tr ürün sayfalarından şu 7 gizli grubun fotoğraflarını aynı yöntemle bul → `public/products/portable/tt-<slug>.jpg`. **Bulunamayan grup `hidden: true` KALIR** (placeholder'lı kart yayınlamıyoruz — katalogda sıfır placeholder kuralı).

```text
Easy Life 15Wp Mobil Solar Şarj · Easy Life Taşınabilir 200-150W · Easy Life 25Wp Katlanabilir
Easy Life 110Wp Katlanabilir · Easy Life Omuz Askısı · 170-110Wp Flexible Dark · 170-110Wp Flexible
```

Not: "Omuz Askısı" aksesuar — görseli bulunsa da `hidden: true` bırak (tek başına kart değeri yok, spec dışı).

- [ ] **Step 3.3: Kategori tile görseli** — `public/products/portable/767-powerhouse.jpg` (veya en temiz görsel) arka planı `mcp remove_background` aracıyla temizlenir → `public/images/products/portable-power.png` (şeffaf PNG, lit-stage'e oturur; mevcut 9 tile ile ışık dili uyumunu görsel kontrolde değerlendir — ciddi sırıtırsa ayrı turda 3D render üretilecek, blocker değil).

- [ ] **Step 3.4: catalog-data.ts — kategori + marka + satırlar.** `CATEGORIES` şu hale gelir (order kaydırma dahil):

```ts
export const CATEGORIES: ProductCategoryItem[] = [
  { _id: "cat-gunes-panelleri", title: "Güneş Panelleri", slug: "gunes-panelleri", order: 1, icon: "panel" },
  { _id: "cat-inverterler", title: "İnverterler", slug: "inverterler", order: 2, icon: "inverter" },
  { _id: "cat-enerji-depolama", title: "Enerji Depolama", slug: "enerji-depolama", order: 3, icon: "battery" },
  { _id: "cat-tasinabilir-guc", title: "Taşınabilir Güç", slug: "tasinabilir-guc", order: 4, icon: "portable" },
  { _id: "cat-sarj-kontrol", title: "Şarj Kontrol Cihazları", slug: "sarj-kontrol", order: 5, icon: "controller" },
  { _id: "cat-solar-paket", title: "Solar Paketler", slug: "solar-paket", order: 6, icon: "package" },
  { _id: "cat-solar-ekipman", title: "Solar Ekipmanlar", slug: "solar-ekipman", order: 7, icon: "mounting" },
  { _id: "cat-isi-pompasi", title: "Isı Pompası", slug: "isi-pompasi", order: 8, icon: "heatpump" },
  { _id: "cat-ev-sarj", title: "EV Şarj İstasyonları", slug: "ev-sarj", order: 9, icon: "evcharge" },
  { _id: "cat-solar-aydinlatma", title: "Solar Aydınlatma", slug: "solar-aydinlatma", order: 10, icon: "lighting" },
];
```

`BRAND`e ekle: `anker: { title: "Anker SOLIX", slug: "anker-solix" },`

`ROWS`a yeni blok (Solar Aydınlatma bloğundan önce; Wh/W değerleri Step 3.1 teyidiyle güncellenir — aşağıdakiler sitedeki listeleme değerleri):

```ts
  // ══ Taşınabilir Güç — Anker SOLIX (kamp / karavan / outdoor) ══════════════
  ["tasinabilir-guc", "anker", "C300 DC Taşınabilir Güç İstasyonu", "288 Wh · 300 W", [300], null, null, ["lfp", "usbC", "lightweight"]],
  ["tasinabilir-guc", "anker", "C300X Taşınabilir Güç İstasyonu", "288 Wh · 300 W", [300], null, null, ["lfp", "acOutlet", "fastCharge"]],
  ["tasinabilir-guc", "anker", "C1000X PowerHouse", "1056 Wh · 1800 W", [1800], null, null, ["lfp", "fastCharge", "appControl"]],
  ["tasinabilir-guc", "anker", "C1000 Gen 2", "1024 Wh · 2000 W", [2000], null, null, ["lfp", "fastCharge", "expandable"]],
  ["tasinabilir-guc", "anker", "C2000 Gen 2", "2048 Wh · 2400 W", [2400], null, null, ["lfp", "expandable", "appControl"]],
  ["tasinabilir-guc", "anker", "F1500 PowerHouse", "1536 Wh · 1800 W", [1800], null, null, ["lfp", "homeBackup", "appControl"]],
  ["tasinabilir-guc", "anker", "767 PowerHouse", "2048 Wh · 2400 W", [2400], null, null, ["lfp", "rvReady", "expandable"]],
  ["tasinabilir-guc", "anker", "PS200 Katlanabilir Solar Panel", "200 W", [200], null, null, ["foldable", "ip67", "kickstand"]],
  ["tasinabilir-guc", "anker", "PS400 Katlanabilir Solar Panel", "400 W", [400], null, null, ["foldable", "ip67", "highEfficiency"]],
  ["tasinabilir-guc", "anker", "EverFrost Akülü Kamp Buzdolabı", "40/43 L · 299 Wh", [], null, null, ["battery", "compressor", "acdc"]],
```

TommaTech taşımaları — mevcut satırlarda yalnız kategori slug'ı + hidden değişir (başlık/slug sabit → Sanity `_id` sabit → createOrReplace günceller):
- `gunes-panelleri`deki 7 portable/flexible satırın ilk elemanı `"tasinabilir-guc"` olur; Step 3.2'de görseli bulunanların sondaki `true` (hidden) parametresi silinir; "Omuz Askısı" `true` kalır.
- `enerji-depolama`daki `"Easy Living — Taşınabilir Güç İstasyonu"` satırının kategorisi `"tasinabilir-guc"` olur.

`IMAGES` map'ine (slug'lar `build()`ün ürettiğiyle birebir — `anker-solix-` öneki + slugify(title)):

```ts
  // ── Taşınabilir Güç (Anker SOLIX) ──
  "anker-solix-c300-dc-tasinabilir-guc-istasyonu": "/products/portable/c300-dc.jpg",
  "anker-solix-c300x-tasinabilir-guc-istasyonu": "/products/portable/c300x.jpg",
  "anker-solix-c1000x-powerhouse": "/products/portable/c1000x.jpg",
  "anker-solix-c1000-gen-2": "/products/portable/c1000-gen2.jpg",
  "anker-solix-c2000-gen-2": "/products/portable/c2000-gen2.jpg",
  "anker-solix-f1500-powerhouse": "/products/portable/f1500.jpg",
  "anker-solix-767-powerhouse": "/products/portable/767-powerhouse.jpg",
  "anker-solix-ps200-katlanabilir-solar-panel": "/products/portable/ps200.jpg",
  "anker-solix-ps400-katlanabilir-solar-panel": "/products/portable/ps400.jpg",
  "anker-solix-everfrost-akulu-kamp-buzdolabi": "/products/portable/everfrost.jpg",
```

+ Step 3.2'de indirilen TommaTech görselleri için aynı düzende satırlar (slug'ı doğrulamak için: `node -e "…slugify kopyası…"` yerine basitçe build sonrası kategori sayfasında karttaki görsel görünüyor mu kontrolü yap; eşleşmeyen slug = görünmeyen görsel).

Dosya başındaki kaynak yorumuna `Anker SOLIX (ankersolixtr.com)` eklenir.

- [ ] **Step 3.5: CategoryGrid CAT_HERO + kategori mesajları** — `CategoryGrid.tsx` `CAT_HERO`ya: `"tasinabilir-guc": "/images/products/portable-power.png",`

tr `Products.categories`: `"tasinabilir-guc": "Taşınabilir Güç"` · `Products.catDesc`: `"tasinabilir-guc": "Kamp, karavan ve outdoor için güç istasyonları ve katlanabilir paneller — Anker SOLIX"`.
en: `"tasinabilir-guc": "Portable Power"` · `"tasinabilir-guc": "Power stations and foldable panels for camping, RV and outdoor — Anker SOLIX"`.

Yeni özellik çipleri — tr `Products.features`e:

```json
"appControl": "Uygulamadan kontrol",
"expandable": "Kapasite genişletilebilir",
"foldable": "Katlanabilir",
"lightweight": "Hafif ve kompakt",
"compressor": "Kompresörlü soğutma",
"homeBackup": "Ev yedek gücü",
"rvReady": "Karavan & tekne uyumlu",
"usbC": "USB-C hızlı çıkış",
"acOutlet": "AC priz çıkışı",
"kickstand": "Ayarlanabilir stant"
```

en:

```json
"appControl": "App control",
"expandable": "Expandable capacity",
"foldable": "Foldable",
"lightweight": "Light & compact",
"compressor": "Compressor cooling",
"homeBackup": "Home backup ready",
"rvReady": "RV & boat ready",
"usbC": "USB-C fast output",
"acOutlet": "AC outlet",
"kickstand": "Adjustable kickstand"
```

(`lfp`, `fastCharge`, `ip67`, `acdc`, `battery`, `highEfficiency` zaten var — yeniden ekleme.)

- [ ] **Step 3.6: `portable` ikonu** — `components/ui/icons.tsx`e mevcut stil (24 viewBox, stroke 1.8, round) ile; `/urunler/[category]` sayfası ikon fallback'i yalnız `IconSolar` kullandığından harita değişikliği gerekmez, ikon `CATEGORIES.icon` alanı için durur:

```tsx
export const IconPortable = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="9" width="16" height="11" rx="2" />
    <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    <path d="M12 12.5v4M10.2 14.5h3.6" />
  </Svg>
);
```

(`Svg` yardımcı bileşeninin gerçek adını dosyadan doğrula — mevcut ikonların sarmalayıcısı neyse onu kullan.)

- [ ] **Step 3.7: Build + görsel kontrol + commit**

```bash
npx eslint . && npm run build
```

Preview'da `/tr/urunler` → 10 tile (Taşınabilir Güç 4. sırada, görselli); `/tr/urunler/tasinabilir-guc` → Anker SOLIX marka bloğu + görselli kartlar; `/en/products/tasinabilir-guc` başlık/çipler İngilizce.

```bash
git add lib/catalog-data.ts components/marketing/CategoryGrid.tsx components/ui/icons.tsx messages/ public/products/portable/ public/images/products/portable-power.png
git commit -m "katalog: Taşınabilir Güç kategorisi — Anker SOLIX kamp ürünleri + TommaTech taşımaları"
```

- [ ] **Step 3.8: Sanity seed** — önce kuru koşu, sonra gerçek; ardından dev server yeniden başlatılmadan içerik görünmez (bilinen gotcha):

```bash
DRY_RUN=1 npm run seed:products   # özet: 10 kategori, ~90 grup, yeni portable görseller listede
npm run seed:products             # beklenen: createOrReplace sayaçları, hata yok
```

Doğrulama: `/tr/urunler` (dev restart sonrası) Sanity'den 10 kategoriyle geliyor. Commit gerekmiyor (seed veri tarafı).

## Task 4: Ana sayfa yönlendirici — Services bandı "5 kapı" olur

**Files:**
- Rewrite: `components/marketing/Services.tsx`, `components/marketing/Services.module.scss`
- Modify: `app/[locale]/(marketing)/services/page.tsx` (metadata namespace)
- Modify: `messages/tr.json`, `messages/en.json` (`Home.gateway` yeni; `Home.services` + `Services` silinir)

- [ ] **Step 4.1: Home.gateway mesajları** — tr:

```json
"gateway": {
  "eyebrow": "Çözümler",
  "title": "Size nasıl yardımcı olalım?",
  "intro": "Beş iş kolu, tek ekip. Neye ihtiyacınız olduğunu seçin — gerisini keşiften devreye almaya biz üstlenelim.",
  "ges": { "title": "Güneş Enerjisi (GES)", "desc": "Çatı, arazi, tarımsal ve carport santralleri — projelendirmeden üretime.", "chips": "Konut · Ticari · Tarım" },
  "bess": { "title": "Enerji Depolama", "desc": "Ev tipi bataryadan konteyner ESS'e; ürettiğinizi saklayın, kesintide devam edin.", "chips": "Ev · İşletme" },
  "heatpump": { "title": "Isı Pompası", "desc": "Isıtma, soğutma, sıcak su ve havuz — elektrifikasyonun konfor ayağı.", "chips": "Konut · Villa · Otel" },
  "evcharge": { "title": "EV Şarj", "desc": "Evde AC, işletmede DC hızlı şarj; carport GES ile doğal ikili.", "chips": "Ev · İşyeri · Filo" },
  "camp": { "title": "Kamp & Outdoor", "desc": "Taşınabilir güç istasyonları, katlanabilir paneller, akülü buzdolabı — şebeke nereye kadar?", "chips": "Kamp · Karavan · Tekne" }
}
```

en:

```json
"gateway": {
  "eyebrow": "Solutions",
  "title": "How can we help?",
  "intro": "Five lines of work, one team. Pick what you need — we carry it from survey to commissioning.",
  "ges": { "title": "Solar Energy (PV)", "desc": "Rooftop, ground-mount, agri-PV and carport plants — from design to production.", "chips": "Homes · Commercial · Agri" },
  "bess": { "title": "Energy Storage", "desc": "From home batteries to container ESS; store what you produce, ride through outages.", "chips": "Home · Business" },
  "heatpump": { "title": "Heat Pumps", "desc": "Heating, cooling, hot water and pools — the comfort side of electrification.", "chips": "Homes · Villas · Hotels" },
  "evcharge": { "title": "EV Charging", "desc": "AC at home, DC fast charging at work; a natural pair with carport PV.", "chips": "Home · Workplace · Fleet" },
  "camp": { "title": "Camping & Outdoor", "desc": "Portable power stations, foldable panels, a battery-powered fridge — how far does the grid go?", "chips": "Camping · RV · Boat" }
}
```

`Home.services` bloğu ve kök `Services` namespace'i **iki dilden de silinir** (GES tip kartlarının metni Task 5'te `Lines.ges.types` altında yeniden yazılıyor; başka tüketici kalmıyor — silmeden önce `grep -rn "Home.services\|getTranslations(\"Services\")" app components` boş dönmeli, Services.tsx rewrite'ı ve services/page.tsx metadata değişimi bundan önce yapılır).

- [ ] **Step 4.2: Services.tsx rewrite** — 5 lit-stage kart (dark), kategori render'ları, kitle çipleri, dolan çizgi + ok. Tam dosya:

```tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import { BUSINESS_LINES } from "@/lib/site";
import type { StaticPathname } from "@/i18n/routing";
import styles from "./Services.module.scss";

// The five doors: four business lines + camping. Renders as the homepage
// gateway (dark band) and as the /services hub. Tiles reuse the catalog's
// 3D renders so the gold-glow imagery language carries through.
const DOORS: ReadonlyArray<{ id: string; href: StaticPathname; img: string }> = [
  { id: "ges", href: "/hizmetler/gunes-enerjisi", img: "/images/products/panels.png" },
  { id: "bess", href: "/hizmetler/enerji-depolama", img: "/images/products/storage.png" },
  { id: "heatpump", href: "/hizmetler/isi-pompasi", img: "/images/products/heat-pumps.png" },
  { id: "evcharge", href: "/hizmetler/ev-sarj", img: "/images/products/ev-charging.png" },
  { id: "camp", href: "/cozumler/kamp-outdoor", img: "/images/products/portable-power.png" },
];

export async function Services({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const t = await getTranslations("Home.gateway");

  return (
    <Section tone="dark" id="cozumler">
      <SectionHeading
        as={headingAs}
        tone="dark"
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />
      <ul className={styles.grid}>
        {DOORS.map(({ id, href, img }) => (
          <li key={id}>
            <Link href={href} className={styles.card}>
              <span className={styles.stage} aria-hidden="true">
                <Image
                  src={img}
                  alt=""
                  width={420}
                  height={240}
                  sizes="(max-width: 700px) 72vw, 300px"
                  className={styles.stageImg}
                />
              </span>
              <span className={styles.body}>
                <span className={styles.chips}>{t(`${id}.chips`)}</span>
                <span className={styles.cardTitle}>{t(`${id}.title`)}</span>
                <span className={styles.cardDesc}>{t(`${id}.desc`)}</span>
                <span className={styles.foot} aria-hidden="true">
                  <span className={styles.rule} />
                  <span className={styles.go}>
                    <IconArrowRight size={16} />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

(`BUSINESS_LINES` importu kullanılmıyorsa satırı çıkar — DOORS zaten href'leri sabitliyor; lint uyarısına göre temizle.)

- [ ] **Step 4.3: Services.module.scss rewrite** — dark lit-stage; mobilde yatay scroll-snap korunur. Tam dosya:

```scss
@use "../../styles/mixins" as *;

/* Homepage gateway — five doors on the dark band. Lit product stage (gold
   wash + dot grid over deep navy) + editorial caption; the foot rule fills
   gold and the arrow chip lights on hover. */

.grid {
  @include list-reset;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-4);

  @include bp-down(1100px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @include bp-down(700px) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: var(--space-3);
    margin-inline: calc(var(--space-4) * -1);
    padding-inline: var(--space-4);

    > li {
      flex: 0 0 72vw;
      max-width: 300px;
      scroll-snap-align: start;
    }
  }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--r-xl);
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  text-decoration: none;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    background 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(242, 168, 44, 0.5);
    background: rgba(255, 255, 255, 0.07);

    .stageImg {
      transform: translateY(-5px) scale(1.05);
    }

    .rule::after {
      transform: scaleX(1);
    }

    .go {
      background: var(--gold);
      border-color: transparent;
      color: var(--on-accent);
      transform: rotate(-45deg);
    }
  }
}

/* Lit stage, dark variant: the render's own gold glow does the work. */
.stage {
  display: grid;
  place-items: center;
  height: 128px;
  padding: var(--space-2) var(--space-3);
  background:
    radial-gradient(120% 120% at 80% 0%, rgba(242, 168, 44, 0.16), transparent 60%),
    radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1.3px);
  background-size:
    auto,
    18px 18px;
}

.stageImg {
  display: block;
  width: min(84%, 210px);
  height: auto;
  filter: drop-shadow(0 16px 22px rgba(0, 0, 0, 0.45));
  transition: transform 0.35s ease;
}

.body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: var(--space-3) var(--space-4) var(--space-4);
}

.chips {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gold-300);
  margin-bottom: var(--space-2);
}

.cardTitle {
  font-family: var(--font-display), sans-serif;
  font-size: 1.08rem;
  font-weight: 700;
  line-height: var(--lh-snug);
  margin-bottom: var(--space-2);
}

.cardDesc {
  font-size: 0.84rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.72);
}

.foot {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-3);
}

.rule {
  position: relative;
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.16);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--gold-500), var(--gold-300));
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.45s ease 0.05s;
  }
}

.go {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.8);
  transition:
    background 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    transform 0.3s ease;
}
```

Eski dosyadaki `existsSync`/`serviceIcon` yaklaşımı ve ikon importları tamamen gider. Var olan CSS değişken adlarını (`--gold-300`, `--on-accent`, `--r-xl`, `bp-down`, `list-reset`) `styles/` altından doğrula — biri yoksa mevcut muadiliyle değiştir.

- [ ] **Step 4.4: /services hub metadata** — `app/[locale]/(marketing)/services/page.tsx` `generateMetadata` namespace'i `Home.services` → `Home.gateway` (title/description aynı anahtar adlarıyla `t("title")`, `t("intro")`). Sayfa gövdesi zaten `<Services headingAs="h1" />` — dokunma.

- [ ] **Step 4.5: Build + görsel kontrol + commit**

```bash
grep -rn "Home.services\|getTranslations(\"Services\")" app components   # beklenen: boş
npx eslint . && npm run build
```

Preview: ana sayfa hero'daki "Çözümlerimiz" butonu `#cozumler`e kaydırıyor; koyu bantta 5 kart, hover'da çizgi doluyor/ok dönüyor; mobil görünümde (`resize 375px`) yatay snap. `/tr/hizmetler` hub'ı aynı bandı h1 ile basıyor.

```bash
git add components/marketing/Services.tsx components/marketing/Services.module.scss "app/[locale]/(marketing)/services/page.tsx" messages/
git commit -m "ana sayfa: Services bandı 5 kapılı yönlendiriciye dönüştü (lit-stage dark)"
```

## Task 5: Kamp landing — /cozumler/kamp-outdoor

**Files:**
- Rewrite: `app/[locale]/(marketing)/cozumler/kamp-outdoor/page.tsx` (stub → gerçek)
- Create: `app/[locale]/(marketing)/cozumler/kamp-outdoor/camp.module.scss`
- Create: `public/images/v2/camp.jpg` (Unsplash outdoor/kamp fotoğrafı — `public/images/v2/CREDITS.md`e satır eklenir)
- Modify: `messages/tr.json`, `messages/en.json` (`Segments.camp` genişler)

- [ ] **Step 5.1: Görsel** — Unsplash'ten kamp/karavan + ışık teması (gün batımında kamp alanı / karavan önü lamba). `curl -L -o public/images/v2/camp.jpg "https://images.unsplash.com/photo-<id>?w=2400&q=80"` — mevcut CREDITS.md formatına fotoğrafçı satırı ekle. 2400px, ~300-500KB hedef.

- [ ] **Step 5.2: Segments.camp mesajları (tr)** — stub'daki 3 anahtarın üzerine tam blok:

```json
"camp": {
  "metaTitle": "Kamp & Outdoor — Taşınabilir Güç",
  "metaDesc": "Kamp, karavan ve tekne için Anker SOLIX taşınabilir güç istasyonları, katlanabilir paneller ve akülü buzdolabı. Doğru boyu birlikte seçelim.",
  "eyebrow": "Kamp & Outdoor",
  "title": "Şebeke nerede biterse, oradan başlıyoruz",
  "intro": "Telefon şarjından karavan buzdolabına — Anker SOLIX taşınabilir güç istasyonları ve katlanabilir panellerle doğada da kendi enerjiniz yanınızda.",
  "sizeEyebrow": "Boy rehberi",
  "sizeTitle": "Hangi boy bana yeter?",
  "sizeIntro": "Kapasiteyi (Wh) ne kadar cihaz, kaç gün sorusu belirler. Üç tipik senaryo:",
  "s1": { "title": "Hafta sonu kampı", "gear": "Telefon, ışık, drone, kamera", "pick": "C300 serisi + PS200 panel", "desc": "288 Wh cebinizde: aydınlatma ve şarj işleri gün boyu, panelle süresiz." },
  "s2": { "title": "Kamp + mutfak konforu", "gear": "Buzdolabı, kettle, laptop", "pick": "C1000 ailesi + PS400 + EverFrost", "desc": "1 kWh sınıfı istasyon EverFrost'u günlerce döndürür; 400 W panelle öğlen dolar." },
  "s3": { "title": "Karavan · tekne · uzun mola", "gear": "Klima kısa süre, indüksiyon, tüm cihazlar", "pick": "767 / F1500 / C2000 + çift panel", "desc": "2 kWh ve 2000 W üstü çıkış: karavanın ana bataryasına güç desteği, teknede sessiz jeneratör." },
  "productsEyebrow": "Vitrin",
  "productsTitle": "Kampçının rafı",
  "productsCta": "Tüm taşınabilir güç ürünleri",
  "whyTitle": "Neden MİNADA'dan?",
  "w1": { "title": "Doğru boylandırma", "desc": "Cihaz listenize göre Wh/W hesabını biz yapar, fazla ya da eksik almanızı engelleriz." },
  "w2": { "title": "Yetkili tedarik", "desc": "Anker SOLIX ürünleri Türkiye garantili, faturalı ve stoktan teslim." },
  "w3": { "title": "Sistem düşünürüz", "desc": "Karavan çatısına sabit panel mi, katlanabilir mi? Kurulum ve kablolama dahil konuşuruz." },
  "ctaTitle": "Kampınıza göre teklif alın",
  "ctaDesc": "Cihazlarınızı yazın, 24 saat içinde boylandırılmış teklifle dönelim."
}
```

en (aynı anahtar yapısı):

```json
"camp": {
  "metaTitle": "Camping & Outdoor — Portable Power",
  "metaDesc": "Anker SOLIX portable power stations, foldable panels and a battery-powered fridge for camping, RVs and boats. Let's size it together.",
  "eyebrow": "Camping & Outdoor",
  "title": "Where the grid ends, we begin",
  "intro": "From phone charging to the RV fridge — with Anker SOLIX portable power stations and foldable panels, your own energy travels with you.",
  "sizeEyebrow": "Size guide",
  "sizeTitle": "How much power do I need?",
  "sizeIntro": "Capacity (Wh) is set by how many devices, for how many days. Three typical scenarios:",
  "s1": { "title": "Weekend camping", "gear": "Phone, lights, drone, camera", "pick": "C300 series + PS200 panel", "desc": "288 Wh in your pocket: lighting and charging all day, indefinitely with a panel." },
  "s2": { "title": "Camp + kitchen comfort", "gear": "Fridge, kettle, laptop", "pick": "C1000 family + PS400 + EverFrost", "desc": "A 1 kWh class station runs the EverFrost for days; the 400 W panel refills it by noon." },
  "s3": { "title": "RV · boat · long stays", "gear": "Short AC bursts, induction, everything", "pick": "767 / F1500 / C2000 + twin panels", "desc": "2 kWh and 2000 W+ output: support for the RV house battery, a silent generator afloat." },
  "productsEyebrow": "Showcase",
  "productsTitle": "The camper's shelf",
  "productsCta": "All portable power products",
  "whyTitle": "Why buy from MİNADA?",
  "w1": { "title": "Right-sizing", "desc": "We run the Wh/W math from your device list so you never over- or under-buy." },
  "w2": { "title": "Authorised supply", "desc": "Anker SOLIX products with Turkish warranty, invoiced, from stock." },
  "w3": { "title": "Systems thinking", "desc": "Fixed panel on the RV roof or foldable? We talk installation and wiring too." },
  "ctaTitle": "Get a camp-sized quote",
  "ctaDesc": "List your gear; we reply within 24 hours with a sized offer."
}
```

- [ ] **Step 5.3: Sayfa** — tam dosya (`page.tsx`):

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { getProductCategories, getProductGroups } from "@/sanity/queries";
import { coverSrc } from "@/sanity/image";
import { buildAlternates } from "@/lib/seo";
import styles from "./camp.module.scss";

export const revalidate = 60;

const SCENARIOS = ["s1", "s2", "s3"] as const;
const WHY = ["w1", "w2", "w3"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Segments.camp" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/cozumler/kamp-outdoor", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Segments.camp");
  const tp = await getTranslations("Products");
  const tc = await getTranslations("Common");

  // Featured shelf: the portable-power category's first products.
  const [categories, groups] = await Promise.all([getProductCategories(), getProductGroups()]);
  const cat = categories.find((c) => c.slug === "tasinabilir-guc");
  const shelf = cat ? groups.filter((g) => g.category?._id === cat._id).slice(0, 6) : [];

  return (
    <>
      <section className={styles.hero} data-hero="">
        <Image
          src="/images/v2/camp.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className={styles.heroPhoto}
        />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.intro}>{t("intro")}</p>
          <div className={styles.actions}>
            <Button href={{ pathname: "/contact", query: { konu: "kamp" } }} size="lg" withArrow>
              {tc("getQuote")}
            </Button>
            <Button
              href={{ pathname: "/urunler/[category]", params: { category: "tasinabilir-guc" } }}
              size="lg"
              variant="glass"
            >
              {t("productsCta")}
            </Button>
          </div>
        </div>
      </section>

      <Section tone="light">
        <SectionHeading eyebrow={t("sizeEyebrow")} title={t("sizeTitle")} intro={t("sizeIntro")} />
        <ul className={styles.sizes}>
          {SCENARIOS.map((id) => (
            <li key={id} className={styles.sizeCard}>
              <h3 className={styles.sizeTitle}>{t(`${id}.title`)}</h3>
              <p className={styles.sizeGear}>{t(`${id}.gear`)}</p>
              <p className={styles.sizePick}>
                <IconCheck size={15} /> {t(`${id}.pick`)}
              </p>
              <p className={styles.sizeDesc}>{t(`${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      {shelf.length > 0 ? (
        <Section tone="sand">
          <SectionHeading eyebrow={t("productsEyebrow")} title={t("productsTitle")} />
          <ul className={styles.shelf}>
            {shelf.map((g) => (
              <li key={g._id}>
                <Link
                  href={{ pathname: "/urunler/[category]", params: { category: "tasinabilir-guc" } }}
                  className={styles.shelfCard}
                >
                  {g.image ? (
                    <span className={styles.shelfStage}>
                      <Image
                        src={typeof g.image === "string" ? g.image : coverSrc(g.image, 360)}
                        alt=""
                        width={360}
                        height={240}
                        sizes="(max-width: 700px) 60vw, 220px"
                        className={styles.shelfImg}
                      />
                    </span>
                  ) : null}
                  <span className={styles.shelfTitle}>{g.title}</span>
                  {g.powerRange ? <span className={styles.shelfPower}>{g.powerRange}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.shelfFoot}>
            <Button
              href={{ pathname: "/urunler/[category]", params: { category: "tasinabilir-guc" } }}
              variant="secondary"
              withArrow
            >
              {t("productsCta")}
            </Button>
          </div>
        </Section>
      ) : null}

      <Section tone="light">
        <SectionHeading title={t("whyTitle")} />
        <ul className={styles.why}>
          {WHY.map((id) => (
            <li key={id} className={styles.whyItem}>
              <h3 className={styles.whyTitle}>{t(`${id}.title`)}</h3>
              <p className={styles.whyDesc}>{t(`${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="dark">
        <div className={styles.cta}>
          <div>
            <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
            <p className={styles.ctaDesc}>{t("ctaDesc")}</p>
          </div>
          <Button href={{ pathname: "/contact", query: { konu: "kamp" } }} size="lg" withArrow>
            {tc("getQuote")}
          </Button>
        </div>
        <span className={styles.ctaArrow} aria-hidden="true">
          <IconArrowRight size={18} />
        </span>
      </Section>
    </>
  );
}
```

Notlar: `Button href`in query/params objesi kabul ettiğini next-intl `Link` tipi sağlar (Button `href`i `ComponentProps<typeof Link>["href"]`). `data-hero` attribute'u header'ın photo-glass modunu tetikler (mevcut mekanizma). `ctaArrow` süs — istenmezse kaldır.

- [ ] **Step 5.4: camp.module.scss** — tam dosya:

```scss
@use "../../../../../styles/mixins" as *;

.hero {
  position: relative;
  min-height: 520px;
  display: grid;
  align-items: end;
  margin-top: calc(var(--header-h) * -1);
  border-radius: 0 0 var(--r-xl) var(--r-xl);
  overflow: hidden;
}

.heroPhoto {
  object-fit: cover;
}

.heroScrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(10, 25, 47, 0.55), rgba(10, 25, 47, 0.15) 45%, rgba(10, 25, 47, 0.72)),
    radial-gradient(90% 60% at 20% 90%, rgba(10, 25, 47, 0.6), transparent 70%);
}

.heroInner {
  position: relative;
  z-index: 1;
  width: min(1160px, 100% - 2 * var(--space-5));
  margin-inline: auto;
  padding: calc(var(--header-h) + var(--space-7)) 0 var(--space-7);
  color: #fff;
  max-width: 720px;
  margin-inline-start: max(calc((100% - 1160px) / 2), var(--space-5));
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold-300);
  margin-bottom: var(--space-3);
}

.title {
  font-family: var(--font-display), sans-serif;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: var(--lh-tight);
  margin-bottom: var(--space-3);
}

.intro {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  max-width: 56ch;
  margin-bottom: var(--space-5);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

/* — Boy rehberi — */
.sizes {
  @include list-reset;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);

  @include bp-down(860px) {
    grid-template-columns: 1fr;
  }
}

.sizeCard {
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background: var(--surface);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
}

.sizeTitle {
  font-family: var(--font-display), sans-serif;
  font-size: 1.15rem;
  margin-bottom: var(--space-1);
}

.sizeGear {
  font-size: 0.82rem;
  color: var(--ink-2);
  margin-bottom: var(--space-3);
}

.sizePick {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--gold-600);
  margin-bottom: var(--space-2);
}

.sizeDesc {
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--ink-2);
}

/* — Vitrin — */
.shelf {
  @include list-reset;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);

  @include bp-down(860px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include bp-down(520px) {
    grid-template-columns: 1fr;
  }
}

.shelfCard {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background: var(--surface);
  overflow: hidden;
  color: var(--ink);
  text-decoration: none;
  transition: transform 0.3s ease, border-color 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(242, 168, 44, 0.4);
  }
}

.shelfStage {
  display: grid;
  place-items: center;
  height: 150px;
  background:
    radial-gradient(120% 110% at 82% 0%, rgba(242, 168, 44, 0.12), transparent 62%),
    radial-gradient(rgba(18, 36, 63, 0.05) 1px, transparent 1.3px),
    linear-gradient(180deg, var(--sand-50), #fff);
  background-size: auto, 18px 18px, auto;
  padding: var(--space-3);
}

.shelfImg {
  width: auto;
  max-width: 88%;
  height: 124px;
  object-fit: contain;
  filter: drop-shadow(0 10px 16px rgba(16, 42, 67, 0.18));
}

.shelfTitle {
  font-weight: 700;
  font-size: 0.95rem;
  padding: var(--space-3) var(--space-4) 0;
}

.shelfPower {
  font-size: 0.8rem;
  color: var(--ink-2);
  padding: 2px var(--space-4) var(--space-4);
}

.shelfFoot {
  display: flex;
  justify-content: center;
  margin-top: var(--space-5);
}

/* — Neden — */
.why {
  @include list-reset;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);

  @include bp-down(860px) {
    grid-template-columns: 1fr;
  }
}

.whyItem {
  border-top: 1px solid var(--line);
  padding-top: var(--space-4);
}

.whyTitle {
  font-family: var(--font-display), sans-serif;
  font-size: 1.05rem;
  margin-bottom: var(--space-2);
}

.whyDesc {
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--ink-2);
}

/* — CTA — */
.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.ctaTitle {
  font-family: var(--font-display), sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  color: #fff;
  margin-bottom: var(--space-2);
}

.ctaDesc {
  color: rgba(255, 255, 255, 0.75);
  max-width: 48ch;
}

.ctaArrow {
  display: none;
}
```

(SCSS değişken/mixin adlarını `styles/` kaynağından doğrula; `--lh-tight` yoksa `--lh-snug` kullan. Hero'nun negatif margin + `--header-h` dansı Hero.module.scss'teki mevcut değerlerle karşılaştırılarak ayarlanır.)

- [ ] **Step 5.5: Build + görsel kontrol + commit**

```bash
npx eslint . && npm run build
```

Preview: `/tr/cozumler/kamp-outdoor` — foto hero (header photo-glass modda), 3 boy kartı, vitrinde Sanity'den gelen görselli kartlar, koyu CTA. `/en/solutions/camping-outdoor` İngilizce.

```bash
git add "app/[locale]/(marketing)/cozumler/kamp-outdoor" public/images/v2/camp.jpg public/images/v2/CREDITS.md messages/
git commit -m "kamp: /cozumler/kamp-outdoor landing — boy rehberi + Anker vitrini"
```

## Task 6: İş kolu sayfaları (4) + Evim/İşletmem zenginleştirme

**Files:**
- Rewrite: `app/[locale]/(marketing)/hizmetler/{gunes-enerjisi,enerji-depolama,isi-pompasi,ev-sarj}/page.tsx`
- Create: `app/[locale]/(marketing)/hizmetler/line.module.scss` (4 sayfanın ortak stili)
- Modify: `app/[locale]/(marketing)/cozumler/evim-icin/page.tsx`, `.../isletmem-icin/page.tsx`
- Modify: `messages/tr.json`, `messages/en.json` (`Lines.*` genişler, `Segments.home/business`e `cross` bloğu)

- [ ] **Step 6.1: Ortak mesaj şeması** — her `Lines.<id>` şu anahtarları taşır: `metaTitle, metaDesc, eyebrow, title, intro, aud1{title,desc}, aud2{title,desc}, f1{q,a}, f2{q,a}, productsTitle, productsCta`. GES ek: `types.{rooftop,ground,agripv,carport}.{title,desc}` + `typesTitle`. Isı pompası ek: `pool{title,desc}`. tr içerik:

```json
"Lines": {
  "ges": {
    "metaTitle": "Güneş Enerjisi (GES) — Çatı, Arazi, Agri-PV, Carport",
    "metaDesc": "Keşiften devreye almaya anahtar teslim GES: imar ve ruhsat süreçleri, proje geliştirme, EPC ve işletme tek çatı altında.",
    "eyebrow": "İş kolumuz",
    "title": "Güneş Enerjisi Santralleri",
    "intro": "Çatıdan araziye, tarımsal alandan otoparka — santralinizi projelendirir, izinlerini yürütür, kurar ve işletiriz. İmar, ÇED ve ruhsat dahil tüm proje geliştirme süreci tek elden.",
    "typesTitle": "Dört kurulum tipi",
    "types": {
      "rooftop": { "title": "Çatı Üstü GES", "desc": "Konut ve işletme çatılarında öz tüketim: faturayı kaynağında düşürür." },
      "ground": { "title": "Arazi Tipi GES (Lisanssız)", "desc": "1–5 MW lisanssız üretim: atıl araziyi gelire dönüştürür." },
      "agripv": { "title": "Tarımsal GES (Agri-PV)", "desc": "Üretim + tarım aynı parselde: sulama yükünü güneş karşılar." },
      "carport": { "title": "Carport / Otopark GES", "desc": "Otopark gölgelendirmesi santrale dönüşür; EV şarjla doğal ikili." }
    },
    "aud1": { "title": "Konut", "desc": "Villa ve müstakil evler için anahtar teslim çatı GES — mahsuplaşma ve %90'a varan fatura tasarrufu. Detaylı akış: Evim için sayfası." },
    "aud2": { "title": "Ticari & Endüstriyel", "desc": "Fabrika, depo, AVM ve tarım işletmeleri: OPEX düşüşü, hızlandırılmış amortisman, kurumsal PPA seçenekleri." },
    "f1": { "q": "İzin ve ruhsat sürecini kim yürütüyor?", "a": "Biz. İmar durumu, ÇED muafiyeti/başvurusu, çağrı mektubu ve bağlantı anlaşması dahil proje geliştirme adımlarının tamamı kapsamımızda." },
    "f2": { "q": "Kurulum ne kadar sürer?", "a": "Çatı sistemlerinde keşiften devreye almaya tipik süre 4–8 hafta; lisanssız arazi projelerinde izin takvimine bağlı olarak 3–6 ay." },
    "productsTitle": "Sahada kullandığımız ekipman",
    "productsCta": "Panel ve inverter kataloğu"
  },
  "bess": {
    "metaTitle": "Enerji Depolama (BESS) — Ev Tipi ve Ticari",
    "metaDesc": "LFP ev bataryalarından konteyner ESS'e enerji depolama: kesintisiz güç, öz tüketim artışı, puant tıraşlama.",
    "eyebrow": "İş kolumuz",
    "title": "Enerji Depolama Sistemleri",
    "intro": "Güneşin ürettiğini akşama taşıyın: LFP bataryalarla kesinti anında devreye giren, öz tüketimi büyüten depolama çözümleri — evden endüstriyel ölçeğe.",
    "aud1": { "title": "Ev tipi", "desc": "Hibrit inverter + duvar tipi LFP batarya: kesintide ev çalışmaya devam eder, gündüz üretim akşam harcanır." },
    "aud2": { "title": "Ticari & Endüstriyel", "desc": "Rack ve konteyner ESS: puant tıraşlama, talep yönetimi ve şebeke hizmetleri için ölçeklenebilir kapasite." },
    "f1": { "q": "Mevcut GES'ime depolama eklenebilir mi?", "a": "Çoğu durumda evet — hibrit invertere geçişle ya da AC-coupled ek üniteyle. Keşifte mevcut sistemi ölçüp net cevap veriyoruz." },
    "f2": { "q": "Batarya ömrü ne kadar?", "a": "Kullandığımız LFP hücreler 6.000+ çevrim sınıfında — günlük bir dolum-boşalımla 15 yıl mertebesi. Kapasite garantileri ürün kartlarında." },
    "productsTitle": "Depolama ürünleri",
    "productsCta": "Enerji depolama kataloğu"
  },
  "heatpump": {
    "metaTitle": "Isı Pompası — Isıtma, Soğutma, Sıcak Su ve Havuz",
    "metaDesc": "Havadan suya ısı pompası ile yerden ısıtmaya, sıcak suya ve havuz ısıtmaya tek cihazla verimli çözüm. GES ile birleşince ısınma güneşten.",
    "eyebrow": "İş kolumuz",
    "title": "Isı Pompası",
    "intro": "Isıtma-soğutma, sıcak su ve yerden ısıtma tek sistemde: elektriğin her birimini 3-4 birim ısıya çeviren ısı pompaları. Çatınızda GES varsa, ısınmanız da güneşten.",
    "aud1": { "title": "Konut", "desc": "Villa ve müstakil evlerde doğalgazsız konfor: yerden ısıtma ve radyatörle uyumlu, sessiz monoblok üniteler." },
    "aud2": { "title": "İşletme", "desc": "Otel, yurt ve spor tesislerinde merkezi sıcak su + iklimlendirme; kaskad kurulumla yüksek kapasite." },
    "pool": { "title": "Havuz Isı Pompası", "desc": "Villa ve otel havuzlarında sezonu Nisan'dan Kasım'a uzatın: R290'lı, soft-start havuz ısı pompalarıyla suyu istediğiniz derecede tutuyoruz." },
    "f1": { "q": "Isı pompası eski binada çalışır mı?", "a": "Çalışır — kritik olan ısı yükü hesabı. Keşifte yalıtım ve mevcut tesisatı ölçüp doğru kapasiteyi belirliyoruz; gerekirse radyatör başına çıkış sıcaklığını yükseltiyoruz." },
    "f2": { "q": "GES ile birlikte kurmanın avantajı ne?", "a": "Isı pompasının tüketimi güneşten karşılanır: ısınma maliyeti fatura yerine çatınızdan gelir. İki sistemi tek projede boyutlandırıyoruz." },
    "productsTitle": "Isı pompası serileri",
    "productsCta": "Isı pompası kataloğu"
  },
  "evcharge": {
    "metaTitle": "EV Şarj İstasyonları — Ev ve İşletme",
    "metaDesc": "Evde 7,4-22 kW AC, işletmede 30-400 kW DC hızlı şarj: projelendirme, kurulum ve carport GES entegrasyonu.",
    "eyebrow": "İş kolumuz",
    "title": "EV Şarj İstasyonları",
    "intro": "Aracınız evde gece, işletmenizde gündüz dolsun: AC duvar ünitelerinden DC hızlı şarj parklarına projelendirme, kurulum ve devreye alma bizde.",
    "aud1": { "title": "Ev", "desc": "7,4–22 kW AC duvar şarjı: sayaç kapasite kontrolü, yük yönetimi ve GES entegrasyonuyla." },
    "aud2": { "title": "İşletme & Filo", "desc": "Otopark ve filolar için OCPP uyumlu DC hızlı şarj; carport GES ile üretim + şarj aynı yapıda." },
    "f1": { "q": "Evimin elektrik altyapısı yeterli mi?", "a": "Keşifte sayaç gücü ve pano kapasitesini ölçüyoruz; gerekiyorsa güç artırımı başvurusunu biz yürütüyoruz. Yük yönetimiyle çoğu evde ek güç gerekmeden kurulum mümkün." },
    "f2": { "q": "İşletmemde şarjı ücretlendirebilir miyim?", "a": "Evet — OCPP uyumlu ünitelerle işletici platformlarına bağlanıp kWh bazlı ücretlendirme yapılabilir; lisans gerekliliklerinde yol gösteriyoruz." },
    "productsTitle": "Şarj üniteleri",
    "productsCta": "EV şarj kataloğu"
  }
}
```

en karşılıkları aynı yapıda çevrilir (pazarlama tonu; "İş kolumuz" → "What we do", havuz bloğu "Pool Heat Pumps" vb.). Task 2.9'daki stub anahtarların üstüne bu bloklar yazılır (stub `title` değerleri korunınca çakışma yok — aynı anahtar).

- [ ] **Step 6.2: line.module.scss** — 4 sayfanın ortak stili (lit-stage imzalı kartlar):

```scss
@use "../../../../styles/mixins" as *;

.grid2 {
  @include list-reset;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);

  @include bp-down(760px) {
    grid-template-columns: 1fr;
  }
}

.grid4 {
  @include list-reset;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);

  @include bp-down(1000px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include bp-down(560px) {
    grid-template-columns: 1fr;
  }
}

.card {
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background: var(--surface);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
}

.cardTitle {
  font-family: var(--font-display), sans-serif;
  font-size: 1.12rem;
  margin-bottom: var(--space-2);
}

.cardDesc {
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--ink-2);
}

.pool {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--space-5);
  border-radius: var(--r-xl);
  padding: var(--space-6);
  color: #fff;
  background:
    radial-gradient(120% 140% at 85% 10%, rgba(242, 168, 44, 0.25), transparent 55%),
    linear-gradient(135deg, #0e2743, #123454);

  @include bp-down(700px) {
    grid-template-columns: 1fr;
  }
}

.poolTitle {
  font-family: var(--font-display), sans-serif;
  font-size: 1.35rem;
  margin-bottom: var(--space-2);
}

.poolDesc {
  color: rgba(255, 255, 255, 0.82);
  max-width: 60ch;
  line-height: 1.6;
}

.faq {
  @include list-reset;
  display: grid;
  gap: var(--space-4);
  max-width: 760px;
}

.faqItem {
  border-top: 1px solid var(--line);
  padding-top: var(--space-4);
}

.faqQ {
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.faqA {
  color: var(--ink-2);
  line-height: 1.6;
}

.productRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
```

- [ ] **Step 6.3: GES sayfası** — `hizmetler/gunes-enerjisi/page.tsx` tam gövde (diğer 3 sayfa aynı iskeletin varyantı):

```tsx
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FinalCta } from "@/components/marketing/FinalCta";
import { buildAlternates } from "@/lib/seo";
import { GES_TYPES } from "@/lib/site";
import styles from "../line.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Lines.ges" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: buildAlternates("/hizmetler/gunes-enerjisi", locale),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lines.ges");
  const tc = await getTranslations("Common");

  return (
    <>
      <Section tone="dark">
        <SectionHeading as="h1" tone="dark" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        <Button href={{ pathname: "/contact", query: { konu: "ges" } }} size="lg" withArrow>
          {tc("getQuote")}
        </Button>
      </Section>

      <Section tone="light">
        <SectionHeading title={t("typesTitle")} />
        <ul className={styles.grid4}>
          {GES_TYPES.map((id) => (
            <li key={id} className={styles.card}>
              <h3 className={styles.cardTitle}>{t(`types.${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`types.${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand">
        <ul className={styles.grid2}>
          {(["aud1", "aud2"] as const).map((id) => (
            <li key={id} className={styles.card}>
              <h3 className={styles.cardTitle}>{t(`${id}.title`)}</h3>
              <p className={styles.cardDesc}>{t(`${id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="light">
        <div className={styles.productRow}>
          <SectionHeading title={t("productsTitle")} />
          <Button
            href={{ pathname: "/urunler/[category]", params: { category: "gunes-panelleri" } }}
            variant="secondary"
            withArrow
          >
            {t("productsCta")}
          </Button>
        </div>
        <ul className={styles.faq}>
          {(["f1", "f2"] as const).map((id) => (
            <li key={id} className={styles.faqItem}>
              <p className={styles.faqQ}>{t(`${id}.q`)}</p>
              <p className={styles.faqA}>{t(`${id}.a`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta />
    </>
  );
}
```

- [ ] **Step 6.4: Diğer 3 sayfa** — aynı iskelet, şu farklarla:
  - `bess`: namespace `Lines.bess`, alternates `/hizmetler/enerji-depolama`, types Section YOK, ürün kategorisi `enerji-depolama`, konu `depolama`.
  - `heatpump`: namespace `Lines.heatpump`, alternates `/hizmetler/isi-pompasi`, types yerine **havuz bandı** (aud grid'inden sonra):

```tsx
      <Section tone="light">
        <div className={styles.pool}>
          <div>
            <h2 className={styles.poolTitle}>{t("pool.title")}</h2>
            <p className={styles.poolDesc}>{t("pool.desc")}</p>
          </div>
          <Button href={{ pathname: "/contact", query: { konu: "isi-pompasi" } }} withArrow>
            {tc("getQuote")}
          </Button>
        </div>
      </Section>
```

  ürün kategorisi `isi-pompasi`, konu `isi-pompasi`.
  - `evcharge`: namespace `Lines.evcharge`, alternates `/hizmetler/ev-sarj`, types YOK, ürün kategorisi `ev-sarj`, konu `ev-sarj`.

- [ ] **Step 6.5: Evim/İşletmem çapraz bölümü** — iki segment sayfasına, steps Section'dan sonra kompakt "Güneşten fazlası" şeridi. `Segments.home` + `Segments.business`a ortak mesajlar (tr):

```json
"cross": {
  "title": "Güneşten fazlası",
  "intro": "GES'in yanına ekleyebilecekleriniz:",
  "heatpump": "Isı Pompası — ısınma da güneşten",
  "evcharge": "EV Şarj — aracınız evde dolsun",
  "bess": "Depolama — kesintiye karşı"
}
```

(en: `"More than solar" / "What you can add next to PV:" / "Heat pump — heating from the sun" / "EV charging — top up at home" / "Storage — outage-proof"`). JSX (her iki sayfada steps Section ile CalculatorTeaser arasına):

```tsx
      <Section tone="sand">
        <SectionHeading title={t("cross.title")} intro={t("cross.intro")} />
        <div className={styles.crossRow}>
          <Button href="/hizmetler/isi-pompasi" variant="secondary" withArrow>
            {t("cross.heatpump")}
          </Button>
          <Button href="/hizmetler/ev-sarj" variant="secondary" withArrow>
            {t("cross.evcharge")}
          </Button>
          <Button href="/hizmetler/enerji-depolama" variant="secondary" withArrow>
            {t("cross.bess")}
          </Button>
        </div>
      </Section>
```

`segment.module.scss`e: `.crossRow { display: flex; flex-wrap: wrap; gap: var(--space-3); }`

- [ ] **Step 6.6: Build + parite + görsel kontrol + commit**

```bash
npx eslint . && npm run build   # i18n parite scripti → YOK/YOK
git add "app/[locale]/(marketing)/hizmetler" "app/[locale]/(marketing)/cozumler" messages/
git commit -m "hizmetler: 4 iş kolu sayfası (havuz ısı pompası dahil) + segment sayfalarına çapraz satış şeridi"
```

## Task 7: Lead formu "konu" alanı + e-posta etiketi

**Files:**
- Modify: `lib/lead-schema.ts`, `components/marketing/LeadForm.tsx`, `lib/email.ts`
- Modify: `app/[locale]/(marketing)/contact/page.tsx` (searchParams `konu` geçişi)
- Modify: `messages/tr.json`, `messages/en.json` (`Contact.form.topic*`)

- [ ] **Step 7.1: Şema** — `lib/lead-schema.ts`e `PROPERTY_TYPES` altına:

```ts
export const LEAD_TOPICS = ["ges", "depolama", "isi-pompasi", "ev-sarj", "kamp", "diger"] as const;
export type LeadTopic = (typeof LEAD_TOPICS)[number];
```

`leadSchema` objesine (`product` satırından sonra): `topic: z.enum(LEAD_TOPICS).optional(),`

- [ ] **Step 7.2: LeadForm select** — `LeadForm.tsx`: prop'lara `defaultTopic?: string` ekle; `defaultValues`e `topic: (LEAD_TOPICS as readonly string[]).includes(defaultTopic ?? "") ? (defaultTopic as LeadTopic) : undefined,`; form gövdesine (propertyType alanının yanına, mevcut select markup kalıbıyla):

```tsx
        <label className={styles.field}>
          <span className={styles.label}>{t("form.topic")}</span>
          <select {...register("topic")} className={styles.input} defaultValue={defaultTopic ?? ""}>
            <option value="" disabled>
              {t("form.topicPlaceholder")}
            </option>
            {LEAD_TOPICS.map((v) => (
              <option key={v} value={v}>
                {t(`form.topics.${v}`)}
              </option>
            ))}
          </select>
        </label>
```

(Mevcut select/option sınıf adlarını dosyadaki `propertyType` alanından birebir kopyala — sınıf adları farklıysa onları kullan.) Contact sayfası: `searchParams`tan `konu` okunup `<LeadForm defaultTopic={konu} …/>` geçilir (mevcut `urun`/`city` prefill kalıbının yanına).

Mesajlar — tr `Contact.form`:

```json
"topic": "Konu",
"topicPlaceholder": "Ne için teklif istiyorsunuz?",
"topics": { "ges": "Güneş Enerjisi (GES)", "depolama": "Enerji Depolama", "isi-pompasi": "Isı Pompası", "ev-sarj": "EV Şarj", "kamp": "Kamp & Taşınabilir Güç", "diger": "Diğer" }
```

en:

```json
"topic": "Topic",
"topicPlaceholder": "What would you like a quote for?",
"topics": { "ges": "Solar Energy (PV)", "depolama": "Energy Storage", "isi-pompasi": "Heat Pump", "ev-sarj": "EV Charging", "kamp": "Camping & Portable Power", "diger": "Other" }
```

- [ ] **Step 7.3: E-posta** — `lib/email.ts`:

```ts
const TOPIC_LABELS: Record<string, string> = {
  ges: "Güneş Enerjisi (GES)",
  depolama: "Enerji Depolama",
  "isi-pompasi": "Isı Pompası",
  "ev-sarj": "EV Şarj",
  kamp: "Kamp & Taşınabilir Güç",
  diger: "Diğer",
};
```

`rows` dizisine `["Konu", data.topic ? TOPIC_LABELS[data.topic] ?? data.topic : "—"],` (İlgilenilen ürün satırının üstüne). `subject` şu olur:

```ts
    subject: `Yeni teklif talebi${data.topic ? ` [${TOPIC_LABELS[data.topic] ?? data.topic}]` : ""} — ${data.name}`,
```

- [ ] **Step 7.4: Build + uçtan uca kontrol + commit**

```bash
npx eslint . && npm run build
```

Preview: `/tr/iletisim?konu=kamp` → Konu select'i "Kamp & Taşınabilir Güç" seçili geliyor; formu doldurup gönder → dev console'da `[lead] RESEND_API_KEY not set — email skipped: {... "topic":"kamp" ...}` satırı (e-posta yolu çalışıyor, key yokken no-op).

```bash
git add lib/lead-schema.ts lib/email.ts components/marketing/LeadForm.tsx "app/[locale]/(marketing)/contact" messages/
git commit -m "lead: konu alanı — CTA'lardan etiketli prefill + e-posta konusuna segment"
```

## Task 8: Tasarım imzasını mixin'e çıkar + yay

**Files:**
- Modify: `styles/mixins.scss` (veya `styles/` altındaki mixin dosyası — `@use "../../styles/mixins"` neyi çözüyorsa o)
- Modify: `components/marketing/CategoryGrid.module.scss` (mixin tüketimine geçiş — görsel çıktı birebir)
- Modify: `components/marketing/ApplicationAreas.module.scss`, `CalculatorTeaser.module.scss`, `Testimonials.module.scss`, `FaqTeaser.module.scss`, `app/[locale]/(marketing)/cozumler/segment.module.scss`

- [ ] **Step 8.1: Mixin'ler** — mixins dosyasına ekle:

```scss
/* — Lit-stage editorial signature (bkz. CategoryGrid) — */

/* Gold-hour wash + dot grid. $tone: light (sand fade) | dark (navy band). */
@mixin lit-stage($tone: light) {
  display: grid;
  place-items: center;

  @if $tone == dark {
    background:
      radial-gradient(120% 120% at 80% 0%, rgba(242, 168, 44, 0.16), transparent 60%),
      radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1.3px);
    background-size:
      auto,
      18px 18px;
  } @else {
    background:
      radial-gradient(120% 110% at 82% 0%, rgba(242, 168, 44, 0.12), transparent 62%),
      radial-gradient(rgba(18, 36, 63, 0.05) 1px, transparent 1.3px),
      linear-gradient(180deg, var(--sand-50), #fff);
    background-size:
      auto,
      18px 18px,
      auto;
  }
}

/* Hairline that fills gold left-to-right when a `.parent:hover` scales it. */
@mixin foot-rule($line: var(--line)) {
  position: relative;
  flex: 1;
  height: 1px;
  background: $line;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--gold-500), var(--gold-300));
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.45s ease 0.05s;
  }
}

/* Circular arrow chip; pair with a hover that fills gold + rotates -45deg. */
@mixin go-chip($size: 34px, $line: var(--line), $ink: var(--ink-2)) {
  display: inline-grid;
  place-items: center;
  width: $size;
  height: $size;
  border-radius: 50%;
  border: 1px solid $line;
  color: $ink;
  transition:
    background 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    transform 0.3s ease;
}

/* Hover payloads (apply inside the interactive parent's &:hover). */
@mixin signature-hover {
  .rule::after {
    transform: scaleX(1);
  }

  .go {
    background: var(--gold);
    border-color: transparent;
    color: var(--on-accent);
    transform: rotate(-45deg);
  }
}
```

- [ ] **Step 8.2: CategoryGrid + Services refactor** — `CategoryGrid.module.scss`: `.catStage` gövdesi `@include lit-stage(light); height:138px; padding:…` olur; `.catRule` → `@include foot-rule;`; `.catGo` → `@include go-chip;`; `.catCard:hover` içindeki rule/go kuralları kalır (sınıf adları farklı olduğundan `signature-hover` mixin'i burada kullanılamaz — mevcut açık kurallar dursun). Services.module.scss'te `.stage` → `@include lit-stage(dark); height:128px; padding:…`, `.rule` → `@include foot-rule(rgba(255,255,255,0.16));`, `.go` → `@include go-chip(32px, rgba(255,255,255,0.22), rgba(255,255,255,0.8));`, hover bloğu `@include signature-hover;` ile sadeleşir. Görsel çıktı DEĞİŞMEMELİ — preview'da önce/sonra karşılaştır.

- [ ] **Step 8.3: Yayma dokunuşları** (her biri küçük, tadında — abartma):
  - **ApplicationAreas**: tile caption'larına ok çipi — label satırının sonuna `<span className={styles.go}><IconArrowRight size={14} /></span>`; scss'e `.go { @include go-chip(28px, rgba(255,255,255,0.35), #fff); }` + tile hover'ında gold dolum (`.tile:hover .go { background: var(--gold); color: var(--on-accent); border-color: transparent; transform: rotate(-45deg); }`). (Tile'lar link değilse Link'e çevirme — sadece mevcut link olanlara uygula; değilse bu maddeyi atla ve commit mesajında not düş.)
  - **CalculatorTeaser**: CTA kartına foot-rule + go — mevcut buton varsa dokunma, kartın altına `.foot > .rule + .go` imza satırı ekle (Services'teki markup'ın light renklisi).
  - **Testimonials / FaqTeaser**: kart hover'ına lift + gold kenar (CategoryGrid `.catCard:hover`daki `transform: translateY(-4px); border-color: rgba(242,168,44,0.4);` ikilisi).
  - **segment.module.scss** (Evim/İşletmem + kamp benefit kartları): `.benefit` hover'ına aynı lift + gold kenar; `.crossRow` butonları zaten `withArrow`.
- [ ] **Step 8.4: Build + görsel tur + commit**

```bash
npx eslint . && npm run build
```

Preview turu: ana sayfa (yönlendirici + teaser), `/tr/urunler`, `/tr/urunler/tasinabilir-guc`, `/tr/cozumler/kamp-outdoor`, `/tr/hizmetler/isi-pompasi`, `/tr/cozumler/evim-icin`, `/tr/iletisim?konu=ges` — masaüstü + 375px mobil; hover imzaları tutarlı, CLS/taşma yok.

```bash
git add styles/ components/marketing/ "app/[locale]/(marketing)/cozumler/segment.module.scss"
git commit -m "tasarım: lit-stage imzası mixin'e çıktı, ApplicationAreas/Calculator/Testimonials/FAQ/segment kartlarına yayıldı"
```

## Task 9: Son doğrulama + kayıt

- [ ] **Step 9.1: Tam tur** — `npm run build` (iki locale tüm rotalar SSG listesinde: 5 yeni rota dahil), i18n parite scripti `YOK/YOK`, `npx eslint .` temiz.
- [ ] **Step 9.2: Preview kanıtları** — şu ekranların ekran görüntüsü alınıp kullanıcıya gösterilir: ana sayfa yönlendirici bandı, mega dropdown açık hali, `/urunler` (10 tile), `/urunler/tasinabilir-guc`, kamp landing hero + boy rehberi, `/hizmetler/isi-pompasi` havuz bandı, mobil menü grupları.
- [ ] **Step 9.3: Değişen davranışların özeti** kullanıcıya raporlanır: kaldırılanlar (`Home.services`, `Services` namespace, hero segment butonları, footer `servicesTitle`), Okan'a gidecek açık maddeler (hero aydınlık görseli ayrı tur; Anker V1 kararı; `git push` Olcay'da).
- [ ] **Step 9.4:** `docs/site-akisi-ia-plani.md`nin başına tek satır not: `> ⚠ 2026-07-11: Birincil İA "5 kapı"ya evrildi — bkz. docs/superpowers/specs/2026-07-11-bes-kapi-ia-kamp-design.md` (+ commit `docs: eski İA planına süpersede notu`).

---

## Self-review kaydı

- **Spec kapsaması:** §1 nav→T1/T2 · §2 ana sayfa→T2(hero)/T4 · §3 katalog→T3 · §4 landing→T5 · §5 hizmet sayfaları+havuz+segment zengin.→T6 · §6 lead→T7 · §7 tasarım→T8 · §8 iletişim→T1(site.ts)+T2(footer notu) · §9 park→T9.3 raporu. Boşluk yok.
- **Sıra düzeltmesi:** routing'e pathname ekleyip sayfasız bırakmak build'i kırar → stub'lar Task 2.9'a alındı (Task 1 tek başına commit'lenmez, T1+T2 birlikte).
- **Tip tutarlılığı:** `NavColumn/columns` Header+MobileNav+site.ts'te aynı; `LEAD_TOPICS` değerleri = CTA `konu` query değerleri = `TOPIC_LABELS` anahtarları; kategori slug'ı `tasinabilir-guc` her yerde; `Lines.*` anahtar şeması 4 sayfada aynı.
- **Placeholder taraması:** kod bloklarının tamamı gerçek içerik; "dosyadan doğrula" notları yalnız mevcut kodun birebir kopyalanamayan detayları için (Svg sarmalayıcı adı, select sınıf adları, SCSS değişken adları) — uygulayıcıya kontrol talimatı, boşluk değil.
