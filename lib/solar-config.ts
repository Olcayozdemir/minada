// ⚠️ PLACEHOLDER coefficients — all estimated. Verify against current market
// data (tariffs, install cost, regional yield) BEFORE launch. Shown to users
// with a visible "estimate" disclaimer.

export const SOLAR_CONFIG = {
  avgTariff: 2.6, // ₺/kWh, residential tariff (PLACEHOLDER)
  costPerKwp: 32000, // ₺/kWp installed (PLACEHOLDER)
  costRange: 0.15, // ± fraction for the estimated cost range
  co2Factor: 0.44, // kg CO₂ / kWh grid (PLACEHOLDER)
  lifespanYears: 25,
  panelKwp: 0.455, // kWp per module, ~455W panel (PLACEHOLDER)
  panelAreaM2: 2.4, // usable roof area per module incl. spacing (PLACEHOLDER)
};

// Regional specific yield (kWh/kWp/year) — PLACEHOLDER, roughly by region.
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

  const { avgTariff, costPerKwp, costRange, co2Factor, lifespanYears, panelKwp, panelAreaM2 } =
    SOLAR_CONFIG;

  const monthlyKwh = input.mode === "bill" ? input.value / avgTariff : input.value;
  const annualConsumption = monthlyKwh * 12;
  const idealKwp = annualConsumption / city.specificYield;

  const panelsNeeded = Math.max(1, Math.round(idealKwp / panelKwp));
  const panelsMax =
    input.roofAreaM2 && input.roofAreaM2 > 0
      ? Math.floor(input.roofAreaM2 / panelAreaM2)
      : panelsNeeded;
  const panelsInstalled = Math.min(panelsNeeded, panelsMax);
  const roofLimited = panelsInstalled < panelsNeeded;

  const systemKwp = panelsInstalled * panelKwp;
  const annualProduction = systemKwp * city.specificYield;
  const systemCost = systemKwp * costPerKwp;
  const annualSavings = Math.min(annualProduction, annualConsumption) * avgTariff;
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
