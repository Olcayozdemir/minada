# MİNADA — Flow Görsel Üretim Promptları

Mevcut asset'lerin (energy-scene2, hero-home-alt) stilinde, sitedeki her slota
oturacak şekilde. Promptlar İngilizce (görüntü modelleri İngilizce'de daha
tutarlı); her birinin başına STYLE CORE bloğunu aynen yapıştır.

## Kullanım

1. `STYLE CORE` + slotun kendi promptu + `AVOID` satırı = tek prompt.
2. En boy oranını slotun yanındaki değere ayarla, en az 2K uzun kenar üret.
3. Aynı oturumda üretirsen (veya seed sabitlersen) sahneler arası tutarlılık artar.
4. **Metin/pano yasak:** önceki render'daki bozuk "33.00 YVWM" panelleri gibi
   üretim hatalarını engellemek için AVOID satırı kritik — hiç UI paneli isteme.

---

## STYLE CORE (her prompta önek)

```
Ultra-realistic premium architectural 3D render, modern minimalist
concrete-and-white architecture, matte black solar panels with warm sunset
reflections, thin glowing cyan energy lines tracing along surfaces like
circuitry, subtle translucent frosted-glass panels, deep navy dusk sky fading
to a golden horizon, warm amber interior window light, lush landscaped garden,
cinematic soft lighting, high-end tech brand aesthetic, photorealistic, 8k.
```

## AVOID (her prompta sonek — negative prompt alanı varsa oraya)

```
no text, no letters, no numbers, no UI panels, no dashboards, no screens,
no logos, no watermarks, no people, no cars with visible badges
```

---

## 1 · Hero varyantları — 16:9 (≥2752×1536)

Kompozisyon şartı: **üst üçte bir sakin gökyüzü** (dev tipografi oraya gelecek),
hikâye ögeleri alt yarıda; sol-alt köşe metin+butonlar için nispeten sade kalsın.

**H1 — villa + batarya + EV (mevcudun kardeşi):**
```
Wide establishing shot of a two-storey modern villa at dusk, rooftop solar
array catching the last golden light, a glowing translucent battery unit by
the entrance, an electric car charging in the driveway with a softly glowing
cyan cable, one continuous cyan energy line flowing from the roof panels down
the facade to the battery and the car, calm gradient dusk sky occupying the
upper third of the frame, garden framing left and right.
```

**H2 — konut + tarla hibrit (geniş nefes):**
```
Cinematic aerial-eye view over a modern solar villa in the foreground and
gentle green fields with a small ground-mounted solar array in the distance,
golden sunset on the horizon line, deep navy sky above, faint cyan energy
pulses connecting roof and landscape, vast calm sky in the upper half.
```

## 2 · Intro kesiti (MİNADA kimdir) — 3:2, düz zemin → şeffaf PNG

Mevcut `hero-home-alt.png`'nin ailesi. Düz koyu zeminde üret, arka planı
sil, ~2700px şeffaf PNG olarak kaydet.

**C1 — yüzen ada kesiti:**
```
Isometric product-render style cutaway of a modern flat-roof villa standing
on a floating landscaped platform slab, rooftop solar panels, large frosted
translucent glass cards hovering behind and beside the house, cyan energy
ribbons weaving around the building and through the glass cards, soft studio
rim lighting, isolated on a plain solid black background, centered, full
object visible with margin on all sides.
```

**C2 — batarya odaklı kesit (ileride hizmet detayına da olur):**
```
Isometric cutaway of a minimalist utility wall with a sleek glowing
translucent home battery unit and inverter, cyan energy lines entering from
above and exiting to a small EV charger, floating concrete base with low
plants, frosted glass slabs behind, isolated on plain solid black background.
```

## 3 · Hizmet kartları — 4:3 yatay (≥1600px, kartta ~200px yükseklik kırpılır → odak merkezde dursun)

**S1 — Güneş Enerjisi:**
```
Close-up of matte black rooftop solar panels at golden hour, warm sun flare
skimming across the glass, thin cyan energy lines glowing in the seams
between panels, deep navy sky above the roof line.
```

**S2 — Batarya Depolama (öncelikli — şu an eğreti duran slot):**
```
A sleek wall-mounted home energy storage battery with a softly glowing cyan
translucent front face, mounted on a clean concrete wall in a minimalist
covered outdoor utility area, warm dusk light from the side, small plants at
the base, single cyan energy line entering the unit from above.
```

**S3 — EV Şarj:**
```
A minimalist matte wallbox EV charger on a concrete garden wall, coiled cyan
glowing charging cable plugged into a generic modern electric car, dusk
lighting with warm reflections on the car body, landscaped driveway.
```

**S4 — Isı Pompası:**
```
A modern matte dark-grey air-source heat pump unit beside a concrete villa
wall, soft stylized cyan airflow ribbons curling out of the fan grille,
evening garden with warm path lights, clean premium composition.
```

## 4 · Uygulama alanı karoları — 3:4 DİKEY (≥1600px kısa kenar)

Alt %25'e cam etiket biniyor → **alt bölge sade/koyu** kalsın.

**A1 — Konut & Bireysel:**
```
Vertical composition, modern family villa with full solar roof at dusk, warm
windows, cyan energy line tracing the roof edge, garden in the dark lower
quarter of the frame.
```

**A2 — Ticari & Endüstriyel:**
```
Vertical composition, elevated view of a large industrial warehouse roof
covered in solar arrays at blue hour, faint cyan grid lines across the
panels, dark loading yard at the bottom of the frame.
```

**A3 — Tarımsal Tesisler:**
```
Vertical composition, agrivoltaic solar rows standing over green crops,
golden late sun grazing the panels, cyan energy pulse along the mounting
rail, soft dark soil in the lower quarter.
```

**A4 — Kamu & Kurumsal:**
```
Vertical composition, modern public building with a solar canopy over its
plaza at dusk, warm facade lighting, single cyan energy line running from
canopy to building, empty calm plaza in the lower quarter.
```

## 5 · Hesaplayıcı görseli — 4:3 yatay

Sol-alt köşeye cam gösterge rozeti biniyor → **sol-alt sade** kalsın.

```
Cozy modern home exterior at blue hour, warm glowing windows, rooftop solar
panels barely catching the last light, a subtle cyan glow from a small energy
meter on the side wall, quiet garden, calm dark lower-left corner.
```

## 6 · Final CTA bandı — 21:9 veya 16:9 geniş

Ortaya cam kart + metin biniyor → **merkez sakin ve koyu**.

```
Very wide night scene of a rooftop solar array under a deep navy sky with the
last ember of sunset at the edge of the frame, faint cyan pulses running
along the panel seams toward the dark calm center of the image, minimal
composition, meditative mood.
```

---

## Teslim formatları

| Slot | Dosya | Boyut/Oran |
|---|---|---|
| Hero | `public/images/…jpeg` | 16:9, ≥2752px |
| Intro kesiti | `public/hero/…png` (şeffaf) | 3:2, ≥2700px |
| Hizmet ×4 | `public/images/v2/service-*.jpg` | 4:3, ≥1600px |
| Alan ×4 | `public/images/v2/area-*.jpg` | 3:4 dikey, ≥1600px |
| Hesaplayıcı | `public/images/v2/calc.jpg` | 4:3, ≥1600px |
| CTA | `public/images/v2/cta.jpg` | 21:9/16:9, ≥2000px |

Aynı adla `public/images/v2/` üstüne yazarsan kod değişikliği gerekmez;
farklı adla verirsen ben bağlarım.
