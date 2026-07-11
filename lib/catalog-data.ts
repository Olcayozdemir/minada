/* eslint-disable @typescript-eslint/no-explicit-any */
// Static product catalog — the SITE renders from this whenever Sanity is not
// configured (the default). If a Sanity project id is set, the CMS wins and
// this is ignored (see sanity/queries.ts). One source of truth for both the
// /urunler showcase and the readable catalog doc in docs/katalog-seed.md.
//
// Rules (carried over from the original seed pipeline):
//   • No prices — every card links to the quote form.
//   • No image hotlinking from cw-enerji.com — images stay empty until we drop
//     in our own assets; the card renders a clean icon placeholder meanwhile.
//   • Product names/specs are language-neutral; the UI localizes category
//     titles, warranty labels and feature keys via the `Products` messages.
//
// Source: CW Enerji / TommaTech dealer listings (cw-enerji.com) + Anker SOLIX
// Türkiye listings (ankersolixtr.com) for the portable-power category.

export type ProductCategoryItem = {
  _id: string;
  title: string;
  slug: string;
  order?: number;
  icon?: string;
  image?: any;
};

export type ProductGroupItem = {
  _id: string;
  title: string;
  slug: string;
  powerRange?: string;
  variants?: number[];
  warrantyProductYears?: number;
  warrantyPerformanceYears?: number;
  features?: string[];
  image?: any;
  featured?: boolean;
  order?: number;
  hidden?: boolean;
  brand?: { title: string; slug?: string; logo?: any };
  category?: { _id: string; title: string; slug: string };
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replaceAll("ç", "c").replaceAll("ğ", "g").replaceAll("ı", "i")
    .replaceAll("ö", "o").replaceAll("ş", "s").replaceAll("ü", "u")
    // Strip combining marks (e.g. İ → i + U+0307 on lowercase) so slugs stay clean.
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ── Categories (display order = `order`; icon = key in the page's icon map) ──
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

const BRAND = {
  cw: { title: "CW Enerji", slug: "cw-enerji" },
  tommatech: { title: "TommaTech", slug: "tommatech" },
  anker: { title: "Anker SOLIX", slug: "anker-solix" },
} as const;

// Shared panel feature bundles (all panels are TOPCon N-Type).
const F_STD = ["topcon", "lowLight", "positiveTolerance", "selfClean"];
const G2G = ["g2g"];

// Compact row form, one per showcase series:
// [categorySlug, brandKey, title, powerRange, variants, wProd, wPerf, features, hidden?]
type Row = [
  string,
  keyof typeof BRAND,
  string,
  string,
  (number | string)[],
  number | null,
  number | null,
  string[],
  boolean?,
];

const ROWS: Row[] = [
  // ══ Güneş Panelleri ══════════════════════════════════════════════════════
  // ── CW Enerji (12) ──
  ["gunes-panelleri", "cw", "M12 132TNBR G2G TOPCon", "655–620 Wp", [655, 650, 645, 640, 635, 630, 625, 620], 12, 30, [...G2G, ...F_STD]],
  ["gunes-panelleri", "cw", "M12 132TNR TOPCon", "655–620 Wp", [655, 650, 645, 640, 635, 630, 625, 620], null, 30, F_STD],
  ["gunes-panelleri", "cw", "M12 108TNBR TOPCon", "535–510 Wp", [535, 530, 525, 520, 515, 510], null, 30, F_STD],
  ["gunes-panelleri", "cw", "M12 132TNB TOPCon", "755–715 Wp", [755, 750, 745, 740, 735, 730, 725, 720, 715], 12, 30, F_STD],
  ["gunes-panelleri", "cw", "M12 132TNB G2G TOPCon", "755–715 Wp", [755, 750, 745, 740, 735, 730, 725, 720, 715], 12, 30, [...G2G, ...F_STD]],
  ["gunes-panelleri", "cw", "M10 144TNB G2G TOPCon", "620–590 Wp", [620, 615, 610, 605, 600, 595, 590], 12, 30, [...G2G, ...F_STD]],
  ["gunes-panelleri", "cw", "M10 144TNB TOPCon", "620–590 Wp", [620, 615, 610, 605, 600, 590], 12, 30, F_STD],
  ["gunes-panelleri", "cw", "M10 144TN TOPCon", "620–590 Wp", [620, 615, 610, 605, 600, 595, 590], 12, 30, F_STD],
  ["gunes-panelleri", "cw", "M10 144TNFB TOPCon Black Series", "620–590 Wp", [620, 615, 610, 605, 600, 595, 590], 12, 30, ["fullBlack", ...F_STD]],
  ["gunes-panelleri", "cw", "M10 108TN TOPCon", "455–420 Wp", [455, 450, 445, 440, 435, 430, 425, 420], 12, 30, F_STD],
  ["gunes-panelleri", "cw", "M10 108TNB G2G TOPCon", "450–435 Wp", [450, 445, 440, 435, 430, 425, 420], 12, 30, [...G2G, ...F_STD]],
  ["gunes-panelleri", "cw", "M10 108TNB TOPCon", "450–420 Wp", [450, 445, 440, 435, 430, 425, 420], 12, 30, F_STD],
  // ── TommaTech (25) ──
  ["gunes-panelleri", "tommatech", "M12 132TNBR G2G TOPCon", "655–620 Wp", [655, 650, 645, 640, 635, 630, 625, 620], 15, 30, [...G2G, ...F_STD]],
  ["gunes-panelleri", "tommatech", "M12 132TNBR TOPCon", "655–620 Wp", [655, 650, 645, 640, 635, 630, 625, 620], 15, 30, F_STD],
  ["gunes-panelleri", "tommatech", "M12 108TNBR TOPCon", "535–510 Wp", [535, 530, 525, 520, 515, 510], null, 30, F_STD],
  ["gunes-panelleri", "tommatech", "M12 132TNB G2G TOPCon", "755–720 Wp", [755, 750, 745, 740, 735, 730, 725, 720], 15, 30, [...G2G, ...F_STD]],
  ["gunes-panelleri", "tommatech", "M12 132TNB TOPCon", "755–720 Wp", [755, 750, 745, 740, 735, 730, 725, 720], 15, 30, F_STD],
  ["gunes-panelleri", "tommatech", "M12 132TNB G2G Diamond Plus", "900–860 Wp (bifacial)", [900, 895, 890, 885, 880, 870, 865, 860], 15, 30, ["bifacial", ...G2G, ...F_STD]],
  ["gunes-panelleri", "tommatech", "M12 108TNB G2G Diamond Plus", "745–715 Wp (bifacial)", [745, 740, 735, 730, 725, 720, 715], 15, 30, ["bifacial", ...G2G, ...F_STD]],
  ["gunes-panelleri", "tommatech", "M10 144TNB Diamond Plus", "745–715 Wp (bifacial)", [745, 740, 735, 730, 725, 720, 715], 15, 30, ["bifacial", ...F_STD]],
  ["gunes-panelleri", "tommatech", "M12 108TN Diamond Plus", "625–610 Wp", [625, 620, 615, 610], 15, 30, F_STD],
  ["gunes-panelleri", "tommatech", "400-240Wp BIPV", "400–240 Wp", [400, 320, 240], 30, 30, ["bipv", ...F_STD]],
  ["gunes-panelleri", "tommatech", "M10 108TN TOPCon", "455–420 Wp", [455, 450, 445, 440, 435, 430, 425, 420], 15, 30, F_STD],
  ["gunes-panelleri", "tommatech", "M10 108TNFB TopCon Dark Series", "455–420 Wp", [455, 450, 445, 440, 435, 430, 425, 420], 15, 30, ["fullBlack", ...F_STD]],
  ["gunes-panelleri", "tommatech", "M10 108TNB TOPCon", "455–420 Wp", [455, 450, 445, 440, 435, 430, 425, 420], 15, 30, F_STD],
  ["gunes-panelleri", "tommatech", "M10 108TNB TOPCon G2G", "455–420 Wp", [455, 450, 445, 440, 435, 430, 425, 420], 15, 30, [...G2G, ...F_STD]],
  ["gunes-panelleri", "tommatech", "M10 144TN TOPCon", "620–590 Wp", [620, 615, 610, 605, 600, 595, 590], 15, 30, F_STD],
  ["gunes-panelleri", "tommatech", "M10 144TNFB TOPCon Dark Series", "620–590 Wp", [620, 615, 610, 605, 600, 595, 590], 15, 30, ["fullBlack", ...F_STD]],
  ["gunes-panelleri", "tommatech", "M10 144TNB TOPCon", "620–600 Wp", [620, 615, 610, 605, 600, 595, 590], 15, 30, F_STD],
  ["gunes-panelleri", "tommatech", "M10 144TNB G2G TOPCon", "620–590 Wp", [620, 615, 610, 605, 600, 595, 590], 15, 30, [...G2G, ...F_STD]],

  // ══ İnverterler (tümü TommaTech — CW Enerji'nin house markası) ════════════
  // Başlıklar dile bağımsız: seri adı + On-Grid / Off-Grid / Hybrid / HV /
  // Microinverter etiketi (bu terimler TR'de de aynen kullanılır). Faz ve
  // segment bilgisi özellik çipleriyle TR + EN gösterilir.
  // ── On-grid (şebeke bağlantılı) ──
  ["inverterler", "tommatech", "Uno Atom / Home (On-Grid)", "0.6–8 kW", [0.6, 1.1, 2, 3, 3.6, 4.6, 5.5, 6, 8], 10, null, ["onGrid", "singlePhase", "zeroExport", "naturalCooling"]],
  ["inverterler", "tommatech", "Trio Inova / Atom K (On-Grid)", "3–15 kW", [3, 4, 5, 6, 8, 10, 12, 15], 5, null, ["onGrid", "threePhase", "zeroExport", "ip65"]],
  ["inverterler", "tommatech", "Trio Castor / Plus K (On-Grid)", "8–30 kW", [8, 10, 12, 15, 18, 20, 22, 25, 30], 5, null, ["onGrid", "threePhase", "highPvVoltage", "airCooling"]],
  ["inverterler", "tommatech", "Trio Evo / Zen (On-Grid)", "30–50 kW", [30, 33, 36, 40, 45, 50], 5, null, ["onGrid", "threePhase", "airCooling", "highPvVoltage"]],
  ["inverterler", "tommatech", "Trio Force / Grand (On-Grid)", "70–136 kW", [70, 75, 80, 90, 100, 110, 120, 125, 136], 5, null, ["onGrid", "threePhase", "surgeProtection", "airCooling"]],
  ["inverterler", "tommatech", "Micro S (Microinverter)", "800 W", [0.8], 10, null, ["microinverter", "plugPlay", "remoteMonitoring"]],
  // ── Hibrit (depolamaya hazır) ──
  ["inverterler", "tommatech", "Uno Hybrid", "3–16 kW", [3, 3.7, 5, 6, 7.5, 8, 12, 16], null, null, ["hybrid", "singlePhase", "backup", "bmsComm"]],
  ["inverterler", "tommatech", "Trio Hybrid / K / Pro", "4–15 kW", [4, 5, 6, 8, 10, 12, 15], null, null, ["hybrid", "threePhase", "backup", "mppt3"]],
  ["inverterler", "tommatech", "Trio Hybrid L / F", "15–30 kW", [15, 20, 25, 30], null, null, ["hybrid", "threePhase", "backup", "dualBattery"]],
  ["inverterler", "tommatech", "Trio Hybrid S (HV)", "5–25 kW", [5, 6, 8, 10, 12, 15, 20, 25], null, null, ["hybrid", "threePhase", "hvBattery", "acCoupling"]],
  ["inverterler", "tommatech", "Trio Hybrid Maxi (HV)", "30–125 kW", [30, 35, 40, 50, 60, 70, 75, 80, 100, 125], null, null, ["hybrid", "threePhase", "hvBattery", "dualBattery"]],
  // ── Off-grid (şebekeden bağımsız) ──
  ["inverterler", "tommatech", "New (Off-Grid)", "1–5 kW", [1, 3, 5], null, null, ["offGrid", "singlePhase", "pwmMppt", "generatorReady"]],
  ["inverterler", "tommatech", "C Pro (Off-Grid)", "3–5 kW", [3, 5], null, null, ["offGrid", "fullSine", "wifi", "bmsComm"]],
  ["inverterler", "tommatech", "C ProX (Off-Grid)", "1.5–8 kW", [1.5, 4.2, 6.2, 8], null, null, ["offGrid", "wifi", "bmsComm", "dualOutput"]],
  ["inverterler", "tommatech", "C PlusX (Off-Grid)", "11 kW", [11], null, null, ["offGrid", "wifi", "bmsComm", "parallel"]],

  // ══ Enerji Depolama (BESS) — TommaTech LFP ════════════════════════════════
  ["enerji-depolama", "tommatech", "Hightech Power — Ev Tipi (LV)", "3–5.8 kWh", [3, 5.8], 10, null, ["lfp", "stackable", "remoteMonitoring"]],
  ["enerji-depolama", "tommatech", "Hightech Power S — Modüler (HV)", "4–24 kWh", [4, 8, 12, 16, 20, 24], null, null, ["lfp", "hvBattery", "modular", "plugPlay"]],
  ["enerji-depolama", "tommatech", "Modular / Rack Serisi (51.2V)", "5–14 kWh", [5, 10, 14], 5, null, ["lfp", "modular", "bmsComm", "ip65"]],
  ["enerji-depolama", "tommatech", "Orion / Hera — Konteyner ESS", "215 kWh+", [], null, null, ["lfp", "liquidCooling", "utilityScale"]],
  // ══ Taşınabilir Güç — Anker SOLIX + TommaTech (kamp / karavan / outdoor) ══
  // Kaynak: ankersolixtr.com canlı listeleme (2026-07-11). Fiyat yok; ev yedek
  // devleri (F3000/F3800/BP3800) bilinçli olarak kapsam dışı — Olcay kararı.
  ["tasinabilir-guc", "anker", "522 PowerHouse", "320 Wh · 300 W", [300], null, null, ["lfp", "usbC", "lightweight"]],
  ["tasinabilir-guc", "anker", "C300X", "288 Wh · 600 W", [600], null, null, ["lfp", "acOutlet", "fastCharge"]],
  ["tasinabilir-guc", "anker", "C300X DC", "288 Wh · 300 W", [300], null, null, ["lfp", "usbC", "lightweight"]],
  ["tasinabilir-guc", "anker", "C800X", "768 Wh · 1200 W", [1200], null, null, ["lfp", "fastCharge", "acOutlet"]],
  ["tasinabilir-guc", "anker", "C1000X PowerHouse", "1056 Wh · 1800 W", [1800], null, null, ["lfp", "fastCharge", "appControl"]],
  ["tasinabilir-guc", "anker", "C1000 Gen 2", "1024 Wh · 2000 W", [2000], null, null, ["lfp", "fastCharge", "expandable"]],
  ["tasinabilir-guc", "anker", "C2000 Gen 2", "2048 Wh · 2400 W", [2400], null, null, ["lfp", "expandable", "appControl"]],
  ["tasinabilir-guc", "anker", "F1500 PowerHouse", "1536 Wh · 1800 W", [1800], null, null, ["lfp", "homeBackup", "appControl"]],
  ["tasinabilir-guc", "anker", "767 PowerHouse", "2048 Wh · 2400 W", [2400], null, null, ["lfp", "rvReady", "expandable"]],
  ["tasinabilir-guc", "anker", "PS200 Solar Panel", "200 W", [200], null, null, ["foldable", "ip67", "kickstand"]],
  ["tasinabilir-guc", "anker", "PS400 Solar Panel", "400 W", [400], null, null, ["foldable", "ip67", "highEfficiency"]],
  ["tasinabilir-guc", "anker", "EverFrost Powered Cooler 43L", "40/43 L · 299 Wh", [], null, null, ["battery", "compressor", "acdc"]],
  ["tasinabilir-guc", "tommatech", "Easy Living — Taşınabilir Güç İstasyonu", "448–2240 Wh", [], null, null, ["portable", "acdc", "lfp"]],
  // TommaTech katlanabilir/esnek paneller — kendi ürün fotoğrafları bulunana
  // kadar gizli (katalogda placeholder kart yayınlamama kuralı).
  ["tasinabilir-guc", "tommatech", "Easy Life 15Wp Mobil Solar Şarj", "15 Wp", [15], null, null, ["portable"], true],
  ["tasinabilir-guc", "tommatech", "Easy Life Taşınabilir", "200–150 W", [200, 150], null, null, ["portable"], true],
  ["tasinabilir-guc", "tommatech", "170-110Wp Flexible Dark Series", "170–110 Wp", [170, 110], 2, null, ["flexible", "fullBlack"], true],
  ["tasinabilir-guc", "tommatech", "Easy Life 25Wp Katlanabilir", "25 Wp", [25], null, null, ["portable"], true],
  ["tasinabilir-guc", "tommatech", "Easy Life 110Wp Katlanabilir", "110 Wp", [110], null, null, ["portable"], true],
  ["tasinabilir-guc", "tommatech", "Easy Life Omuz Askısı (aksesuar)", "", [], null, null, ["portable"], true],
  ["tasinabilir-guc", "tommatech", "170-110Wp Flexible Serisi", "170–110 Wp", [170, 110], 2, null, ["flexible"], true],

  // ══ Şarj Kontrol Cihazları — TommaTech ════════════════════════════════════
  ["sarj-kontrol", "tommatech", "MPPT Şarj Kontrol Cihazı", "30–100 A", [30, 40, 50, 60, 80, 100], null, null, ["mppt", "wideVoltage", "lcd"]],
  ["sarj-kontrol", "tommatech", "PWM Şarj Kontrol Cihazı", "10–45 A", [10, 20, 30, 45], null, null, ["pwm", "lcd", "dualUsb"]],

  // ══ Solar Paketler — anahtar teslim sistemler (CW Enerji) ═════════════════
  ["solar-paket", "cw", "On-Grid Paket (Tek / Üç Faz)", "5–15 kW", [5, 10, 15], null, null, ["onGrid", "turnkey", "threePhase"]],
  ["solar-paket", "cw", "Hibrit Paket (Depolamalı)", "6–15 kW", [6, 10, 15], null, null, ["hybrid", "battery", "backup"]],
  ["solar-paket", "cw", "Off-Grid Paket", "1–11 kW", [1, 3, 7.2, 11], null, null, ["offGrid", "battery", "standalone"]],
  ["solar-paket", "cw", "Solar Otopark Paketi (Carport)", "430–590 Wp/araç", [], null, null, ["carport", "turnkey", "onGrid"]],
  ["solar-paket", "cw", "Tarımsal Sulama Paketi", "0.75–110 kW", [0.75, 5.5, 22, 110], null, null, ["offGrid", "irrigation", "pumpDrive"]],
  ["solar-paket", "tommatech", "Balkon / Mikroinverter Seti", "300 W", [0.3], null, null, ["microinverter", "plugPlay", "balcony"]],

  // ══ Solar Ekipmanlar (BoS / montaj) — CW Enerji ═══════════════════════════
  ["solar-ekipman", "cw", "Montaj & Konstrüksiyon (Çatı + Arazi)", "", [], null, null, ["mounting", "roofGround", "aluminum"]],
  ["solar-ekipman", "cw", "Arazi / Üçgen Ayak Sistemleri", "", [], null, null, ["groundMount", "galvanized"]],
  ["solar-ekipman", "cw", "Solar Kablo (PV1-F)", "4 / 6 / 10 mm²", [], null, null, ["cable", "dcCable"]],
  ["solar-ekipman", "cw", "MC4 Konnektör & Setler", "1500V · IP68", [], null, null, ["connector", "mc4", "ip68"]],
  ["solar-ekipman", "cw", "Kelepçe, Vida & Sızdırmazlık", "", [], null, null, ["clamps", "fasteners", "sealing"]],

  // ══ Isı Pompası — TommaTech (havadan suya) ════════════════════════════════
  ["isi-pompasi", "tommatech", "Titan Serisi (Monoblok, R32)", "6–26 kW", [6, 8, 10, 12, 16, 20, 26], null, null, ["monoblock", "dcInverter", "wifi"]],
  ["isi-pompasi", "tommatech", "Power Serisi (R290 / R32)", "8–24 kW", [8, 12, 16, 24], null, null, ["dcInverter", "r290", "wideOperating"]],
  ["isi-pompasi", "tommatech", "Triome — All-in-One (R290)", "10 kW", [10], null, null, ["allInOne", "r290", "integratedTank"]],
  ["isi-pompasi", "tommatech", "Aquavera — Havuz (R290)", "24–33 kW", [24, 33], null, null, ["poolHeatPump", "r290", "softStart"]],

  // ══ EV Şarj İstasyonları — TommaTech ══════════════════════════════════════
  ["ev-sarj", "tommatech", "AC Şarj (Trio / Likya)", "7.4–22 kW", [7.4, 11, 22], null, null, ["acCharge", "type2", "threePhase"]],
  ["ev-sarj", "tommatech", "DC Hızlı Şarj", "30–400 kW", [30, 60, 120, 240, 400], null, null, ["dcCharge", "fastCharge", "ocpp"]],

  // ══ Solar Aydınlatma — TommaTech (off-grid armatürler) ════════════════════
  ["solar-aydinlatma", "tommatech", "Yol / Sokak Aydınlatma", "20–90 W", [20, 36, 58, 90], null, null, ["streetLight", "microwaveSensor", "lfp"]],
  ["solar-aydinlatma", "tommatech", "Yürüyüş Yolu Aydınlatma", "10–20 W", [10, 20], null, null, ["pathLight", "microwaveSensor", "lfp"]],
  ["solar-aydinlatma", "tommatech", "All-in-One / Hexagon", "20–36 W", [20, 36], null, null, ["allInOneLight", "glassGlass", "highEfficiency"]],
  ["solar-aydinlatma", "tommatech", "Single / Double Line", "20–36 W", [20, 36], null, null, ["linearLight", "offGrid", "ip65"]],
  ["solar-aydinlatma", "tommatech", "Bolard Aydınlatma", "5 W", [5], null, null, ["bollardLight", "offGrid", "lfp"]],
];

const CAT_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

// Self-hosted product photos (keyed by group slug → /public path). Sourced from
// the TommaTech/CW Enerji dealer listings and served from our own domain (no
// hotlinking). Series without an entry fall back to the icon placeholder.
const IMAGES: Record<string, string> = {
  // Uno on-grid: reuse the near-identical Uno single-phase unit photo.
  "tommatech-uno-atom-home-on-grid": "/products/inverters/uno-hybrid.webp",
  "tommatech-trio-inova-atom-k-on-grid": "/products/inverters/trio-inova.jpg",
  "tommatech-trio-castor-plus-k-on-grid": "/products/inverters/trio-castor.jpg",
  "tommatech-trio-evo-zen-on-grid": "/products/inverters/trio-evo.jpg",
  "tommatech-trio-force-grand-on-grid": "/products/inverters/trio-force.jpg",
  "tommatech-micro-s-microinverter": "/products/inverters/micro-s.webp",
  "tommatech-uno-hybrid": "/products/inverters/uno-hybrid.webp",
  "tommatech-trio-hybrid-k-pro": "/products/inverters/trio-hybrid.webp",
  "tommatech-trio-hybrid-l-f": "/products/inverters/trio-hybrid-l.jpg",
  "tommatech-trio-hybrid-s-hv": "/products/inverters/trio-hybrid-s.webp",
  "tommatech-trio-hybrid-maxi-hv": "/products/inverters/trio-hybrid-maxi.webp",
  "tommatech-new-off-grid": "/products/inverters/new.webp",
  "tommatech-c-pro-off-grid": "/products/inverters/c-pro.webp",
  "tommatech-c-prox-off-grid": "/products/inverters/c-prox.jpg",
  "tommatech-c-plusx-off-grid": "/products/inverters/c-plusx.jpg",
  // ── Enerji Depolama ──
  "tommatech-hightech-power-ev-tipi-lv": "/products/storage/hightech-lv.jpg",
  "tommatech-hightech-power-s-moduler-hv": "/products/storage/hightech-hv.webp",
  "tommatech-modular-rack-serisi-51-2v": "/products/storage/rack.jpg",
  "tommatech-orion-hera-konteyner-ess": "/products/storage/container.webp",
  "tommatech-easy-living-tasinabilir-guc-istasyonu": "/products/storage/easy-living.webp",
  // ── Taşınabilir Güç (Anker SOLIX — ankersolixtr.com'dan self-host) ──
  "anker-solix-522-powerhouse": "/products/portable/522.jpg",
  "anker-solix-c300x": "/products/portable/c300x.jpg",
  "anker-solix-c300x-dc": "/products/portable/c300x-dc.jpg",
  "anker-solix-c800x": "/products/portable/c800x.jpg",
  "anker-solix-c1000x-powerhouse": "/products/portable/c1000x.jpg",
  "anker-solix-c1000-gen-2": "/products/portable/c1000-gen2.jpg",
  "anker-solix-c2000-gen-2": "/products/portable/c2000-gen2.jpg",
  "anker-solix-f1500-powerhouse": "/products/portable/f1500.jpg",
  "anker-solix-767-powerhouse": "/products/portable/767-powerhouse.jpg",
  "anker-solix-ps200-solar-panel": "/products/portable/ps200.jpg",
  "anker-solix-ps400-solar-panel": "/products/portable/ps400.jpg",
  "anker-solix-everfrost-powered-cooler-43l": "/products/portable/everfrost.jpg",
  // ── Şarj Kontrol ──
  "tommatech-mppt-sarj-kontrol-cihazi": "/products/charge/mppt.webp",
  "tommatech-pwm-sarj-kontrol-cihazi": "/products/charge/pwm.webp",
  // ── Solar Paketler (hibrit → on-grid görseli; benzer sistem kiti) ──
  "cw-enerji-on-grid-paket-tek-uc-faz": "/products/packages/on-grid.jpg",
  "cw-enerji-hibrit-paket-depolamali": "/products/packages/on-grid.jpg",
  "cw-enerji-off-grid-paket": "/products/packages/off-grid.jpg",
  "cw-enerji-solar-otopark-paketi-carport": "/products/packages/carport.webp",
  "cw-enerji-tarimsal-sulama-paketi": "/products/packages/irrigation.jpg",
  "tommatech-balkon-mikroinverter-seti": "/products/packages/balcony.jpg",
  // ── Solar Ekipmanlar ──
  "cw-enerji-montaj-konstruksiyon-cati-arazi": "/products/equipment/mounting.webp",
  "cw-enerji-arazi-ucgen-ayak-sistemleri": "/products/equipment/ground.jpg",
  "cw-enerji-solar-kablo-pv1-f": "/products/equipment/cable.jpg",
  "cw-enerji-mc4-konnektor-setler": "/products/equipment/connector.jpg",
  "cw-enerji-kelepce-vida-sizdirmazlik": "/products/equipment/clamps.png",
  // ── Isı Pompası (aquavera → power görseli; benzer ünite) ──
  "tommatech-titan-serisi-monoblok-r32": "/products/heatpump/titan.jpg",
  "tommatech-power-serisi-r290-r32": "/products/heatpump/power.webp",
  "tommatech-triome-all-in-one-r290": "/products/heatpump/triome.jpg",
  "tommatech-aquavera-havuz-r290": "/products/heatpump/power.webp",
  // ── EV Şarj ──
  "tommatech-ac-sarj-trio-likya": "/products/ev/ac.jpg",
  "tommatech-dc-hizli-sarj": "/products/ev/dc.jpg",
  // ── Solar Aydınlatma (yürüyüş yolu → sokak görseli) ──
  "tommatech-yol-sokak-aydinlatma": "/products/lighting/street.webp",
  "tommatech-yuruyus-yolu-aydinlatma": "/products/lighting/street.webp",
  "tommatech-all-in-one-hexagon": "/products/lighting/all-in-one.webp",
  "tommatech-single-double-line": "/products/lighting/line.webp",
  "tommatech-bolard-aydinlatma": "/products/lighting/bolard.webp",
};

// Panels look near-identical across series, so pick a product photo by type
// (standard / dark / bifacial) rather than per-series. Other categories use the
// explicit IMAGES map above; a series with neither shows the icon placeholder.
function categoryFallbackImage(catSlug: string, title: string): string | undefined {
  if (catSlug !== "gunes-panelleri") return undefined;
  if (/FB|Dark|Black/i.test(title)) return "/products/panels/dark.jpg";
  if (/G2G|Diamond|BIPV/i.test(title)) return "/products/panels/g2g.webp";
  return "/products/panels/standard.jpg";
}

function build(rows: Row[]): ProductGroupItem[] {
  return rows.map((row, i) => {
    const [catSlug, brandKey, title, powerRange, variants, wProd, wPerf, features, hidden] = row;
    const cat = CAT_BY_SLUG.get(catSlug)!;
    const brand = BRAND[brandKey];
    const slug = `${brand.slug}-${slugify(title)}`;
    return {
      _id: `group-${slug}`,
      title,
      slug,
      powerRange: powerRange || undefined,
      variants: variants.map(Number),
      ...(wProd ? { warrantyProductYears: wProd } : {}),
      ...(wPerf ? { warrantyPerformanceYears: wPerf } : {}),
      features,
      image: IMAGES[slug] ?? categoryFallbackImage(catSlug, title),
      featured: false,
      order: i + 1,
      hidden: Boolean(hidden),
      brand: { title: brand.title, slug: brand.slug },
      category: { _id: cat._id, title: cat.title, slug: cat.slug },
    };
  });
}

// All groups incl. hidden (for tooling); the showcase getter filters hidden out.
export const GROUPS_ALL: ProductGroupItem[] = build(ROWS);
export const GROUPS: ProductGroupItem[] = GROUPS_ALL.filter((g) => !g.hidden);
