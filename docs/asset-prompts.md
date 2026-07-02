# MİNADA — Flow Görsel Üretim Promptları (gerçekçi set, kopyala-yapıştır)

İlke: **üründen ve gerçeklikten kopma.** Sahneler gerçek kurulumlar gibi;
cyan ışıma yalnızca gerçekte ışık yayan yerlerde (şarj LED'i, batarya durum
ışığı, bahçe/yol aydınlatması). Dil "fotoğraf" dili — render değil.
Her prompt kendi başına tam. Aynı adla `public/images/v2/` üstüne yazarsan
kod değişikliği gerekmez.

---

## 1 · HERO — 16:9, ≥2752px (üst üçte bir sakin gökyüzü — tipografi oraya biner)

**H1 — villa, alacakaranlık (gerçekçi):**

```
Professional architectural photograph, full-frame camera, ultra sharp, photorealistic. Very wide establishing shot of a modern two-storey white-and-concrete villa at dusk, matte black solar panels covering the roof and catching the last warm light, a slim wall-mounted home battery with a small cyan status LED visible near the entrance, an electric car parked in the driveway charging from a wallbox with a softly glowing LED ring on the plug, warm light in the windows, landscaped garden with subtle path lights, deep blue evening sky fading to a golden horizon, the upper third of the frame calm open sky. Natural colors, cinematic but believable lighting. No text, no letters, no numbers, no logos, no watermarks, no people, no visible car badges.
```

**H2 — çatı kurulumu, gün ışığı (geniş ve ferah):**

```
Professional architectural photograph, full-frame camera, ultra sharp, photorealistic. Wide elevated shot over the solar-covered roof of a modern house in crisp morning light, rows of matte black panels sparkling subtly in the sun, the neighborhood of modern homes and green gardens stretching softly blurred into the distance, vivid blue sky with a few soft clouds filling the calm upper third of the frame, fresh clean atmosphere. Natural colors, believable light. No text, no letters, no numbers, no logos, no watermarks, no people.
```

## 2 · INTRO KESİTİ — 4:3 üret (obje ortada, bol marjlı), düz zeminde → şeffaf PNG (`public/hero/`)

Mevcut `hero-home-alt.png` stilize ve iş görüyor; alternatif olarak daha
ürün-gerçekçi bir kesit istersen:

```
Professional product-style 3D visualization, photorealistic, believable materials. An isometric cutaway of a modern flat-roof house on a neat landscaped base: matte black solar panels on the roof, a wall-mounted home battery with a small cyan status LED beside the entrance, a wallbox EV charger on the garage wall, realistic garden plants. Clean studio lighting, centered, full object visible with generous margin, isolated on a plain solid black background. No floating objects, no glowing lines in the air. No text, no letters, no numbers, no logos, no watermarks, no people.
```

## 3 · HİZMET KARTLARI — 4:3, ≥1600px, odak merkezde (`service-*.jpg`)

Hero'yla aynı dil: premium render estetiği + gerçek ürün + cyan ışıma
yüzeylerde/kablolarda (havada uçmuyor) — ama gün ışığında; mavi gökyüzü koyu
bantta iyi kontrast verir. Dördü aynı oturumda üret ki ton tutsun.

**S1 — Güneş Enerjisi:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. Close-up of matte black solar panels on the flat roof of a modern concrete-and-white house in crisp clear daylight, sun sparkle on the glass, thin cyan light lines tracing along the panel seams and mounting rails like a premium smart-energy visualization, vivid blue sky above the roof line. High-end tech brand aesthetic, believable real installation. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people.
```

**S2 — Batarya Depolama:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. A sleek modern home battery unit with a softly glowing translucent cyan front panel, mounted on a clean concrete wall beside a villa entrance in soft bright daylight under a covered walkway, a thin cyan light line running along the wall conduit into the unit, small plants at the base, fresh green garden blurred behind. High-end tech brand aesthetic, believable real installation. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people.
```

**S3 — EV Şarj:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. A minimalist matte wallbox EV charger on a concrete garden wall in crisp clear daylight, its charging cable with a soft cyan light accent along its length, plugged into a generic modern electric car with clean bright reflections on the body, landscaped driveway, vivid blue sky. High-end tech brand aesthetic, believable real installation. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people, no visible car badges.
```

**S4 — Isı Pompası:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. A modern matte dark-grey air-source heat pump unit beside a concrete villa wall in crisp clear daylight, a subtle cyan status light on its front edge and a thin cyan line tracing the pipe run along the wall, tidy garden with fresh green plants, clean bright shadows, vivid blue sky. High-end tech brand aesthetic, believable real installation. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people.
```

## 4 · UYGULAMA ALANLARI — 3:4 DİKEY, ≥1600px kısa kenar, alt çeyrek sade (`area-*.jpg`)

Hizmet kartlarıyla aynı dil: premium render + gerçek kurulum + yüzeylerde
ince cyan detay, gün ışığı. Dördü aynı oturumda üret.

**A1 — Konut & Bireysel:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. Vertical composition: a modern concrete-and-white family villa with a full matte black solar roof in crisp clear daylight, a thin cyan light line tracing the roof edge along the panel rail, vivid blue sky above, tidy green garden filling the shaded lower quarter of the frame. High-end tech brand aesthetic, believable real installation. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people.
```

**A2 — Ticari & Endüstriyel:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. Vertical composition: dramatic low three-quarter view of a sleek modern logistics facility — clean concrete facade with a glass office corner — its long roofline topped by a crisp row of matte black solar panels seen edge-on against a vivid blue sky, a thin cyan light line running along the panel rail and down the facade conduit, landscaped strip with young trees in the shaded lower quarter of the frame. High-end tech brand aesthetic, believable real installation. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people, no trucks.
```

**A3 — Tarımsal Tesisler:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. Vertical composition: ground-mounted solar panel rows standing over fresh green crops on an agrivoltaic farm in crisp clear daylight, sun sparkle on the matte black panels, a thin cyan light line along the mounting rail, vivid blue sky, soft shaded soil in the lower quarter of the frame. High-end tech brand aesthetic, believable farm setting. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people.
```

**A4 — Kamu & Kurumsal:**

```
Ultra-realistic premium architectural 3D render, photorealistic 8k. Vertical composition: a modern public building with matte black solar panels on its roof and a slim solar canopy over the entrance plaza in crisp clear daylight, a thin cyan light line tracing the canopy edge, vivid blue sky, calm shaded plaza in the lower quarter of the frame. High-end tech brand aesthetic, believable real installation. No text, no letters, no numbers, no UI panels, no dashboards, no logos, no watermarks, no people, no flags.
```

## 5 · HESAPLAYICI — 4:3, ≥1600px, sol-alt sade (`calc.jpg`)

```
Professional architectural photograph, full-frame camera, ultra sharp, photorealistic. A cozy modern home exterior at dusk, warm glowing windows, matte black solar panels on the roof catching the last light, quiet tidy garden, deep blue evening sky fading to a warm horizon, calm uncluttered lower-left corner of the frame. Natural colors, believable lighting. No text, no letters, no numbers, no logos, no watermarks, no people.
```

## 6 · FİNAL CTA BANDI — 16:9, ≥2000px, merkez sakin ve koyu (`cta.jpg`)

```
Professional photograph, full-frame camera, ultra sharp, photorealistic. Very wide minimal night scene of solar panels on a dark rooftop under a deep blue evening sky, the last faint warm glow of sunset at the far edge of the frame, subtle reflections on the panel glass, the center of the image calm and dark. Natural colors, meditative mood. No text, no letters, no numbers, no logos, no watermarks, no people.
```

## 7 · OG / SOSYAL KARTI — 16:9 üret, sonra 1200×630'a kırpılır (`public/og/og-default.png`)

Sol yarı sakin ve koyu (üstüne logo+slogan bindirilecek), sahne sağa yaslı.
16:9'u ben üst-alttan hafif kırpıp 1200×630'a getiririm — sen sadece üret.

```
Professional architectural photograph, ultra sharp, photorealistic. Wide composition: on the right half, a modern villa with a matte black solar roof at dusk with warm windows; the left half is calm deep blue evening sky and soft dark garden, intentionally simple and uncluttered. Natural colors, believable lighting. No text, no letters, no numbers, no logos, no watermarks, no people.
```

---

## Not

- Konsept/imaj çekimi istenirse (liman-ada marka evreni, makro panel vb.)
  eski cesur set git geçmişinde: `git show 549674e^:docs/asset-prompts.md`
  civarı — ama varsayılan bu gerçekçi set.
- Üretimde bir görselde LED/ışık abartılı gelirse "subtle" kelimesini
  "barely visible" yap; tamamen kaldırmak istersen LED cümlesini sil.
