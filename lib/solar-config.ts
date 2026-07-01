// ⚠️ PLACEHOLDER coefficients — all estimated. Verify against current market
// data (tariffs, install cost, regional yield) BEFORE launch. Shown to users
// with a visible "estimate" disclaimer.

export const SOLAR_CONFIG = {
  avgTariff: 2.6, // ₺/kWh, residential tariff (PLACEHOLDER)
  costPerKwp: 32000, // ₺/kWp installed (PLACEHOLDER)
  costRange: 0.15, // ± fraction for the estimated cost range
  co2Factor: 0.44, // kg CO₂ / kWh grid (PLACEHOLDER)
  lifespanYears: 25,
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
};

export type CalcResult = {
  monthlyKwh: number;
  annualConsumption: number;
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

  const { avgTariff, costPerKwp, costRange, co2Factor, lifespanYears } = SOLAR_CONFIG;

  const monthlyKwh = input.mode === "bill" ? input.value / avgTariff : input.value;
  const annualConsumption = monthlyKwh * 12;
  const systemKwp = annualConsumption / city.specificYield;
  const annualProduction = systemKwp * city.specificYield; // sized to cover usage
  const systemCost = systemKwp * costPerKwp;
  const annualSavings = Math.min(annualProduction, annualConsumption) * avgTariff;
  const paybackYears = annualSavings > 0 ? systemCost / annualSavings : 0;
  const savings25yr = annualSavings * lifespanYears;
  const co2Savings = annualProduction * co2Factor;

  return {
    monthlyKwh,
    annualConsumption,
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
