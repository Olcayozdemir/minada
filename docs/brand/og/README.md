# OG kartı

`public/og/og-default.jpg` (1200×630) bu şablondan basılıyor. Metin de logo da
buradan geliyor, yani slogan değişirse kartı yeniden üretmek gerekiyor.

## Üretme

```
cd docs/brand/og
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --user-data-dir=/tmp/og-chrome \
  --window-size=1200,630 --screenshot=/tmp/og.png \
  --virtual-time-budget=6000 "file://$PWD/og-card.html"
```

Chrome ekran görüntüsünü yazdıktan sonra temiz çıkmıyor, birkaç saniye sonra
öldür; PNG zaten yazılmış oluyor. Sonra JPEG'e çevir:

```
node -e 'require("sharp")("/tmp/og.png").jpeg({quality:92,chromaSubsampling:"4:4:4",mozjpeg:true}).toFile("public/og/og-default.jpg")'
```

## Neden JPEG

Zemin yumuşak bir lacivert gradyan. Paletli PNG (256 renk) onu gözle görülür
şekilde benekliyor; düz PNG ise 247K. JPEG q92 gradyanı temiz veriyor ve 65K.
`chromaSubsampling: "4:4:4"` şart, yoksa altın metin ve krem kontur kenarlarında
renk bulanması oluyor.

## Notlar

- Logo doğrudan `public/logo/logo1-on-dark.png`'den okunuyor (kopya tutulmuyor,
  yoksa logo değişince burası sessizce bayatlar). Zemin lacivert olduğu için koyu
  varyant kullanılıyor.
- Fontlar Google Fonts'tan geliyor, üretirken ağ gerekiyor.
- Başlık sitedeki hero ile aynı: birinci satır Bricolage, ikinci satır altın
  Fraunces italik.
- Görünen metinde uzun tire (—) ve kısa tire (–) yok, proje kuralı.
