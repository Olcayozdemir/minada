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
  batteryCostPerKwh: 18000, // ₺/kWh installed storage (PLACEHOLDER)
  batteryCyclesPerYear: 300, // effective full day→night shift cycles (PLACEHOLDER)
};

/** Yield multiplier by roof orientation — PLACEHOLDER. */
export const ORIENTATIONS = ["south", "southMix", "eastWest"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];
export const ORIENTATION_FACTOR: Record<Orientation, number> = {
  south: 1,
  southMix: 0.96,
  eastWest: 0.85,
};

/** Yield multiplier by roof pitch — PLACEHOLDER. */
export const ROOF_PITCHES = ["flat", "moderate", "steep"] as const;
export type RoofPitch = (typeof ROOF_PITCHES)[number];
export const PITCH_FACTOR: Record<RoofPitch, number> = {
  flat: 0.92,
  moderate: 1,
  steep: 0.96,
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
  /** selfConsumed / annualConsumption — what the coverage gauge shows. */
  coverageRatio: number;
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
    costRange,
    co2Factor,
    lifespanYears,
    panelKwp,
    panelAreaM2,
    batteryCostPerKwh,
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

  const panelsNeeded = Math.max(1, Math.round(idealKwp / panelKwp));
  const panelsMax =
    input.roofAreaM2 && input.roofAreaM2 > 0
      ? Math.floor(input.roofAreaM2 / panelAreaM2)
      : panelsNeeded;
  const panelsInstalled = Math.min(panelsNeeded, panelsMax);
  const roofLimited = panelsInstalled < panelsNeeded;

  const systemKwp = panelsInstalled * panelKwp;
  const annualProduction = systemKwp * specificYield;

  // Self-consumption: what's produced while people are home is used directly;
  // a battery shifts (part of) the rest into the evening, capped by how many
  // full cycles a year it can realistically run.
  const usableProduction = Math.min(annualProduction, annualConsumption);
  const directUse = usableProduction * dayUseRatio;
  const batteryShifted = Math.min(usableProduction - directUse, batteryKwh * batteryCyclesPerYear);
  const selfConsumed = directUse + batteryShifted;

  const batteryCost = batteryKwh * batteryCostPerKwh;
  const systemCost = systemKwp * costPerKwp + batteryCost;
  const annualSavings = selfConsumed * avgTariff;
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
    coverageRatio: annualConsumption > 0 ? selfConsumed / annualConsumption : 0,
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
