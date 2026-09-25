// Katsayılar Olcay'ın fizibilite modelinden (2026-08-06, revize): GES 700
// USD/kWp × 47 USD/TL, 5 TL/kWh tarife, Güney 1600 / G-K ve D-B 1350
// kWh/kWp·yıl. Batarya kademeli USD fiyatla maliyete DAHİL. Bütün fiyatlar
// KDV HARİÇ; geri dönüş süresi de KDV hariç hesaplanır.
// Örnek doğrulama: 30 kWp → 987.000 TL, güneyde 48.000 kWh/yıl → 240.000
// TL/yıl tasarruf → ~4,1 yıl geri dönüş (fizibilitedeki ~4,4 bandı).

const USD_PER_KWP = 700;
const USD_TRY = 47;

/** Batarya paket fiyatları, USD (KDV hariç) — kademeli, kWh başına değil. */
export const BATTERY_COST_USD: Record<number, number> = {
  0: 0,
  5: 1750,
  10: 2750,
  15: 3500,
};

export const SOLAR_CONFIG = {
  avgTariff: 5, // ₺/kWh elektrik birim fiyatı
  costPerKwp: USD_PER_KWP * USD_TRY, // 32.900 ₺/kWp kurulu maliyet (KDV hariç)
  usdTry: USD_TRY,
  costRange: 0.15, // ± fraction for the estimated cost range
  co2Factor: 0.44, // kg CO₂ / kWh grid (PLACEHOLDER)
  lifespanYears: 25,
  panelKwp: 0.455, // kWp per module, ~455W panel (PLACEHOLDER)
  panelAreaM2: 2.4, // usable roof area per module incl. spacing (PLACEHOLDER)
  batteryCyclesPerYear: 300, // effective full day→night shift cycles (PLACEHOLDER)
};

/** Yön çarpanı — fizibilite: Güney 1600, G-K ve D-B 1350 kWh/kWp·yıl. */
export const ORIENTATIONS = ["south", "southNorth", "eastWest"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];
export const ORIENTATION_FACTOR: Record<Orientation, number> = {
  south: 1,
  southNorth: 1350 / 1600,
  eastWest: 1350 / 1600,
};

/** Yield multiplier by roof pitch — PLACEHOLDER. */
export const ROOF_PITCHES = ["flat", "moderate", "steep"] as const;
export type RoofPitch = (typeof ROOF_PITCHES)[number];
export const PITCH_FACTOR: Record<RoofPitch, number> = {
  flat: 0.92,
  moderate: 1,
  steep: 0.96,
};

// Regional specific yield (kWh/kWp/year), GÜNEY yönü için. Fizibilitenin baz
// değeri 1600; iller onun etrafında bölgesel nüans verir (İç Anadolu ≈ baz,
// Akdeniz / Güneydoğu üstünde, Karadeniz altında). İlk sekiz ilin değeri
// Olcay'ın modelinden; diğerleri aynı bölge bandından türetilmiş tahmindir.
//
// 81 il. Sıra dropdown sırasıdır: önce MİNADA'nın hizmet illeri (Malatya
// başta), ardından geri kalanlar Türkçe alfabetik. `id` ilin aksansız küçük
// harf hâlidir — RoofMapPlanner seçilen ilin adını bu biçime indirip eşler.
// İl adları iki dilde de aynı olduğu için çeviri dosyasında değil burada.
export const CITIES = [
  { id: "malatya", name: "Malatya", specificYield: 1650 },
  { id: "adiyaman", name: "Adıyaman", specificYield: 1680 },
  { id: "elazig", name: "Elazığ", specificYield: 1630 },
  { id: "sivas", name: "Sivas", specificYield: 1580 },
  { id: "erzincan", name: "Erzincan", specificYield: 1580 },
  { id: "antalya", name: "Antalya", specificYield: 1700 },
  { id: "adana", name: "Adana", specificYield: 1650 },
  { id: "afyonkarahisar", name: "Afyonkarahisar", specificYield: 1600 },
  { id: "agri", name: "Ağrı", specificYield: 1560 },
  { id: "aksaray", name: "Aksaray", specificYield: 1640 },
  { id: "amasya", name: "Amasya", specificYield: 1500 },
  { id: "ankara", name: "Ankara", specificYield: 1600 },
  { id: "ardahan", name: "Ardahan", specificYield: 1480 },
  { id: "artvin", name: "Artvin", specificYield: 1350 },
  { id: "aydin", name: "Aydın", specificYield: 1580 },
  { id: "balikesir", name: "Balıkesir", specificYield: 1500 },
  { id: "bartin", name: "Bartın", specificYield: 1300 },
  { id: "batman", name: "Batman", specificYield: 1650 },
  { id: "bayburt", name: "Bayburt", specificYield: 1500 },
  { id: "bilecik", name: "Bilecik", specificYield: 1480 },
  { id: "bingol", name: "Bingöl", specificYield: 1600 },
  { id: "bitlis", name: "Bitlis", specificYield: 1600 },
  { id: "bolu", name: "Bolu", specificYield: 1420 },
  { id: "burdur", name: "Burdur", specificYield: 1640 },
  { id: "bursa", name: "Bursa", specificYield: 1500 },
  { id: "canakkale", name: "Çanakkale", specificYield: 1500 },
  { id: "cankiri", name: "Çankırı", specificYield: 1500 },
  { id: "corum", name: "Çorum", specificYield: 1500 },
  { id: "denizli", name: "Denizli", specificYield: 1600 },
  { id: "diyarbakir", name: "Diyarbakır", specificYield: 1660 },
  { id: "duzce", name: "Düzce", specificYield: 1350 },
  { id: "edirne", name: "Edirne", specificYield: 1450 },
  { id: "erzurum", name: "Erzurum", specificYield: 1540 },
  { id: "eskisehir", name: "Eskişehir", specificYield: 1540 },
  { id: "gaziantep", name: "Gaziantep", specificYield: 1680 },
  { id: "giresun", name: "Giresun", specificYield: 1250 },
  { id: "gumushane", name: "Gümüşhane", specificYield: 1450 },
  { id: "hakkari", name: "Hakkari", specificYield: 1700 },
  { id: "hatay", name: "Hatay", specificYield: 1620 },
  { id: "igdir", name: "Iğdır", specificYield: 1580 },
  { id: "isparta", name: "Isparta", specificYield: 1640 },
  { id: "istanbul", name: "İstanbul", specificYield: 1400 },
  { id: "izmir", name: "İzmir", specificYield: 1550 },
  { id: "kahramanmaras", name: "Kahramanmaraş", specificYield: 1640 },
  { id: "karabuk", name: "Karabük", specificYield: 1380 },
  { id: "karaman", name: "Karaman", specificYield: 1680 },
  { id: "kars", name: "Kars", specificYield: 1500 },
  { id: "kastamonu", name: "Kastamonu", specificYield: 1380 },
  { id: "kayseri", name: "Kayseri", specificYield: 1620 },
  { id: "kirikkale", name: "Kırıkkale", specificYield: 1560 },
  { id: "kirklareli", name: "Kırklareli", specificYield: 1430 },
  { id: "kirsehir", name: "Kırşehir", specificYield: 1580 },
  { id: "kilis", name: "Kilis", specificYield: 1680 },
  { id: "kocaeli", name: "Kocaeli", specificYield: 1400 },
  { id: "konya", name: "Konya", specificYield: 1650 },
  { id: "kutahya", name: "Kütahya", specificYield: 1520 },
  { id: "manisa", name: "Manisa", specificYield: 1560 },
  { id: "mardin", name: "Mardin", specificYield: 1700 },
  { id: "mersin", name: "Mersin", specificYield: 1680 },
  { id: "mugla", name: "Muğla", specificYield: 1650 },
  { id: "mus", name: "Muş", specificYield: 1580 },
  { id: "nevsehir", name: "Nevşehir", specificYield: 1620 },
  { id: "nigde", name: "Niğde", specificYield: 1660 },
  { id: "ordu", name: "Ordu", specificYield: 1250 },
  { id: "osmaniye", name: "Osmaniye", specificYield: 1630 },
  { id: "rize", name: "Rize", specificYield: 1200 },
  { id: "sakarya", name: "Sakarya", specificYield: 1400 },
  { id: "samsun", name: "Samsun", specificYield: 1350 },
  { id: "siirt", name: "Siirt", specificYield: 1680 },
  { id: "sinop", name: "Sinop", specificYield: 1350 },
  { id: "sanliurfa", name: "Şanlıurfa", specificYield: 1720 },
  { id: "sirnak", name: "Şırnak", specificYield: 1700 },
  { id: "tekirdag", name: "Tekirdağ", specificYield: 1430 },
  { id: "tokat", name: "Tokat", specificYield: 1480 },
  { id: "trabzon", name: "Trabzon", specificYield: 1250 },
  { id: "tunceli", name: "Tunceli", specificYield: 1580 },
  { id: "usak", name: "Uşak", specificYield: 1560 },
  { id: "van", name: "Van", specificYield: 1680 },
  { id: "yalova", name: "Yalova", specificYield: 1400 },
  { id: "yozgat", name: "Yozgat", specificYield: 1560 },
  { id: "zonguldak", name: "Zonguldak", specificYield: 1300 },
] as const;

export type CityId = (typeof CITIES)[number]["id"];

/** Preselected province — MİNADA's home base, first in the list. */
export const DEFAULT_CITY: CityId = "malatya";

/** How many provinces lead the list before the alphabetical rest. */
const FEATURED_CITY_COUNT = 6;

/** Dropdown options, with a rule closing the featured group. */
export const CITY_OPTIONS = CITIES.map((city, index) => ({
  value: city.id,
  label: city.name,
  separatorAfter: index === FEATURED_CITY_COUNT - 1,
}));

export function cityName(id: string): string {
  return CITIES.find((c) => c.id === id)?.name ?? id;
}

export type CalcInput = {
  mode: "bill" | "consumption";
  value: number; // ₺/month (bill) or kWh/month (consumption)
  cityId: CityId;
  /** Usable roof area in m². When set, the system is clamped to what fits. */
  roofAreaM2?: number;
  /** Roof orientation — scales yield. Defaults to south. */
  orientation?: Orientation;
  /** Roof pitch — scales yield. Defaults to moderate. */
  pitch?: RoofPitch;
  /** Share of consumption that happens while the sun is up (0–1). Default 0.5. */
  dayUseRatio?: number;
  /** Battery capacity in kWh; 0 or undefined = no storage. */
  batteryKwh?: number;
};

export type CalcResult = {
  monthlyKwh: number;
  annualConsumption: number;
  /** kWp that would fully cover the consumption (unclamped). */
  idealKwp: number;
  /** Modules needed for the ideal system. */
  panelsNeeded: number;
  /** Modules that fit the given roof area (== panelsNeeded when no area given). */
  panelsMax: number;
  /** Modules actually simulated/installed = min(needed, max). */
  panelsInstalled: number;
  /** True when the roof area limits the system below the ideal size. */
  roofLimited: boolean;
  /** Roof area the ideal system would need, m². */
  roofAreaNeededM2: number;
  /** Installed (possibly clamped) system size — all economics use this. */
  systemKwp: number;
  annualProduction: number;
  /** kWh/year the household actually offsets (direct use + battery shift). */
  selfConsumed: number;
  /** Annual generation / annual consumption, capped at 100% in the UI. */
  consumptionCoverageRatio: number;
  /** Share of generated energy consumed on site, directly or through storage. */
  selfConsumptionRatio: number;
  batteryKwh: number;
  batteryCost: number;
  systemCost: number;
  costLow: number;
  costHigh: number;
  annualSavings: number;
  savings25yr: number;
  paybackYears: number;
  co2Savings: number; // kg/year
};

export function calculateSolar(input: CalcInput): CalcResult | null {
  const city = CITIES.find((c) => c.id === input.cityId);
  if (!city || !Number.isFinite(input.value) || input.value <= 0) return null;

  const {
    avgTariff,
    costPerKwp,
    usdTry,
    costRange,
    co2Factor,
    lifespanYears,
    panelKwp,
    panelAreaM2,
    batteryCyclesPerYear,
  } = SOLAR_CONFIG;

  const orientationFactor = ORIENTATION_FACTOR[input.orientation ?? "south"];
  const pitchFactor = PITCH_FACTOR[input.pitch ?? "moderate"];
  const dayUseRatio = Math.min(1, Math.max(0, input.dayUseRatio ?? 0.5));
  const batteryKwh = Math.max(0, input.batteryKwh ?? 0);
  const specificYield = city.specificYield * orientationFactor * pitchFactor;

  const monthlyKwh = input.mode === "bill" ? input.value / avgTariff : input.value;
  const annualConsumption = monthlyKwh * 12;
  const idealKwp = annualConsumption / specificYield;

  // A fractional module cannot be installed. Round upward so the recommendation
  // never silently undersizes the system against the calculated annual need.
  const panelsNeeded = Math.max(1, Math.ceil(idealKwp / panelKwp));
  const panelsMax =
    input.roofAreaM2 && input.roofAreaM2 > 0
      ? Math.floor(input.roofAreaM2 / panelAreaM2)
      : panelsNeeded;
  const panelsInstalled = Math.min(panelsNeeded, panelsMax);
  const roofLimited = panelsInstalled < panelsNeeded;

  const systemKwp = panelsInstalled * panelKwp;
  const annualProduction = systemKwp * specificYield;

  // Kapsama göstergesi için öz-tüketim ayrımı: gündüz kullanılan pay doğrudan,
  // batarya kalanın bir kısmını akşama taşır.
  const usableProduction = Math.min(annualProduction, annualConsumption);
  const directUse = usableProduction * dayUseRatio;
  const batteryShifted = Math.min(usableProduction - directUse, batteryKwh * batteryCyclesPerYear);
  const selfConsumed = directUse + batteryShifted;

  // Batarya kademeli USD paket fiyatıyla maliyete dahil (revize fizibilite).
  // Ara değer gelirse 5 kWh paket oranıyla yaklaşıklanır.
  const batteryUsd = BATTERY_COST_USD[batteryKwh] ?? (batteryKwh / 5) * BATTERY_COST_USD[5];
  const batteryCost = batteryUsd * usdTry;
  const systemCost = systemKwp * costPerKwp + batteryCost;
  // Fizibilite modeli (mahsuplaşma): üretimin tamamı tarife üzerinden tasarruf
  // sayılır — tasarruf = yıllık üretim × birim fiyat.
  const annualSavings = annualProduction * avgTariff;
  const paybackYears = annualSavings > 0 ? systemCost / annualSavings : 0;
  const savings25yr = annualSavings * lifespanYears;
  const co2Savings = annualProduction * co2Factor;

  return {
    monthlyKwh,
    annualConsumption,
    idealKwp,
    panelsNeeded,
    panelsMax,
    panelsInstalled,
    roofLimited,
    roofAreaNeededM2: Math.ceil(panelsNeeded * panelAreaM2),
    systemKwp,
    annualProduction,
    selfConsumed,
    consumptionCoverageRatio:
      annualConsumption > 0 ? Math.min(annualProduction, annualConsumption) / annualConsumption : 0,
    selfConsumptionRatio: annualProduction > 0 ? selfConsumed / annualProduction : 0,
    batteryKwh,
    batteryCost,
    systemCost,
    costLow: systemCost * (1 - costRange),
    costHigh: systemCost * (1 + costRange),
    annualSavings,
    savings25yr,
    paybackYears,
    co2Savings,
  };
}

/** How many modules a roof of the given area can host. */
export function panelCapacityForArea(areaM2: number): number {
  return Math.max(0, Math.floor(areaM2 / SOLAR_CONFIG.panelAreaM2));
}
