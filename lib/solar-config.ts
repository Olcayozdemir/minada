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
// değeri 1600; şehirler onun etrafında bölgesel nüans verir (İç Anadolu ≈ baz).
export const CITIES = [
  { id: "istanbul", specificYield: 1400 },
  { id: "ankara", specificYield: 1600 },
  { id: "izmir", specificYield: 1550 },
  { id: "antalya", specificYield: 1700 },
  { id: "bursa", specificYield: 1500 },
  { id: "adana", specificYield: 1650 },
  { id: "konya", specificYield: 1650 },
  { id: "gaziantep", specificYield: 1680 },
] as const;

export type CityId = (typeof CITIES)[number]["id"];

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
