// Marka türetmelerini docs/brand/ içindeki iki ustadan yeniden üretir.
// Çalıştır: node docs/brand/rebuild-logo.mjs   (repo kökünden)
//
// Palet kuantizasyonu (png palette:true) bilerek KULLANILMIYOR: 256 renge
// düşürmek güneşin ve yaprakların degradelerini bantlıyordu. Dosyalar tam
// renk; tel üzerinde zaten next/image'in ürettiği küçük varyant gidiyor.
import sharp from "sharp";

const LIGHT = "docs/brand/minada-mark-master.png";        // lacivert kontur, açık zemin için
const DARK = "docs/brand/minada-mark-on-dark-master.png"; // beyaz kontur, koyu zemin için

const trim = (src) => sharp(src).trim({ threshold: 0 }).toBuffer();
// Logolar tam renk. İkonlar 16-32px basıldığı için palet bandı görünmüyor ve
// favicon her sayfada ham servis edildiğinden boyut orada gerçekten önemli.
const png = { compressionLevel: 9 };
const pngSmall = { palette: true, quality: 92, effort: 10 };

// Header 40px basıyor; 240px 6x, 3x retinanın iki katı pay bırakıyor.
for (const [src, out] of [[LIGHT, "public/logo/logo1.png"], [DARK, "public/logo/logo1-on-dark.png"]]) {
  await sharp(await trim(src)).resize({ height: 240, kernel: "lanczos3" }).png(png).toFile(out);
}

// Favicon: kare tuval, saydam zemin (Olcay tercihi). Marka geniş olduğu için
// genişliği sonuna kadar kullan, yoksa 16px'te yüksekliğin yarısında kalıyor.
const W = 512;
const INSET = Math.round(W * 0.96);
const icon = await sharp(await trim(LIGHT)).resize({ width: INSET, kernel: "lanczos3" }).toBuffer();
const im = await sharp(icon).metadata();
await sharp({ create: { width: W, height: W, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: icon, top: Math.round((W - im.height) / 2), left: Math.round((W - INSET) / 2) }])
  .png(pngSmall)
  .toFile("app/icon.png");

// iOS alfayı siyaha bastığı için Apple ikonu beyaz zeminli.
const apple = await sharp(await trim(LIGHT)).resize({ width: 164, kernel: "lanczos3" }).toBuffer();
const am = await sharp(apple).metadata();
await sharp({ create: { width: 180, height: 180, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
  .composite([{ input: apple, top: Math.round((180 - am.height) / 2), left: Math.round((180 - 164) / 2) }])
  .png(pngSmall)
  .toFile("app/apple-icon.png");

for (const f of ["public/logo/logo1.png", "public/logo/logo1-on-dark.png", "app/icon.png", "app/apple-icon.png"]) {
  const m = await sharp(f).metadata();
  console.log(f.padEnd(32), `${m.width}x${m.height}`, m.channels + "ch");
}
