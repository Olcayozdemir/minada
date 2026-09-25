"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import {
  CITY_OPTIONS,
  DEFAULT_CITY,
  ORIENTATIONS,
  ROOF_PITCHES,
  calculateSolar,
  cityName,
  panelCapacityForArea,
  type CityId,
  type Orientation,
  type RoofPitch,
} from "@/lib/solar-config";
import { IconArrowRight } from "@/components/ui/icons";
import { CalculatorLeadGate } from "./CalculatorLeadGate";
import { CalculatorSelect } from "./CalculatorSelect";
import styles from "./Calculator.module.scss";

// WebGL sim is heavy (three.js), so it loads lazily on the client only; the
// placeholder holds its height to avoid layout shift.
const RoofSim3D = dynamic(() => import("./RoofSim3D"), {
  ssr: false,
  loading: () => <div className={styles.simLoading} aria-hidden="true" />,
});

const ORIENTATION_KEY: Record<Orientation, string> = {
  south: "orientationSouth",
  southNorth: "orientationSouthNorth",
  eastWest: "orientationEastWest",
};

const PITCH_KEY: Record<RoofPitch, string> = {
  flat: "pitchFlat",
  moderate: "pitchModerate",
  steep: "pitchSteep",
};

const BATTERY_OPTIONS = [0, 5, 10, 15]; // kWh

/* Pill segmented control — same visual language as the bill/consumption toggle. */
function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  format,
  label,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  format: (v: T) => string;
  label: string;
}) {
  return (
    <div className={styles.seg} role="radiogroup" aria-label={label}>
      {options.map((opt) => (
        <button
          key={String(opt)}
          type="button"
          role="radio"
          aria-checked={value === opt}
          className={clsx(styles.segBtn, value === opt && styles.segActive)}
          onClick={() => onChange(opt)}
        >
          {format(opt)}
        </button>
      ))}
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={clsx(styles.metric, highlight && styles.metricHi)}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
  );
}

/* Glass gauge chip — same language as the hero's stat chips. */
const RING_C = 126; // 2πr for r=20

function Gauge({ pct, value, label }: { pct: number; value: string; label: string }) {
  const offset = RING_C * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <div className={styles.gauge}>
      <svg className={styles.gaugeRing} width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="none" stroke="#e0e4e8" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r="20"
          fill="none"
          stroke="#b97706"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          transform="rotate(-90 26 26)"
          className={styles.gaugeArc}
        />
      </svg>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function Calculator({ initialBill = "1500", initialCity = DEFAULT_CITY, fromDemo = false }: { initialBill?: string; initialCity?: string; fromDemo?: boolean }) {
  const t = useTranslations("Calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<"bill" | "consumption">("bill");
  const [value, setValue] = useState(initialBill);
  const [cityId, setCityId] = useState(initialCity);
  const [roofArea, setRoofArea] = useState(60);
  const [orientation, setOrientation] = useState<Orientation>("south");
  const [pitch, setPitch] = useState<RoofPitch>("moderate");
  const [dayUse, setDayUse] = useState(50); // %
  const [batteryKwh, setBatteryKwh] = useState(0);
  const [step, setStep] = useState(0);
  const [showStepError, setShowStepError] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useState(false);

  const num = parseFloat(value.replace(",", "."));
  const result =
    cityId && num > 0
      ? calculateSolar({
          mode,
          value: num,
          cityId: cityId as CityId,
          roofAreaM2: roofArea,
          orientation,
          pitch,
          dayUseRatio: dayUse / 100,
          batteryKwh,
        })
      : null;

  const capacity = panelCapacityForArea(roofArea);

  const fmt = (n: number, digits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(n);
  const fmtTL = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(n);
  const fmtPct = (n: number) =>
    new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(n / 100);

  const simCards = result
    ? [
        { label: t("simCardSystem"), value: `${fmt(result.systemKwp, 1)} kWp` },
        { label: t("simCardProduction"), value: `${fmt(result.annualProduction)} kWh` },
      ]
    : undefined;

  const stepLabels = locale === "tr"
    ? ["Tüketim", "Çatı", "Kullanım", "Sonuç"]
    : ["Usage", "Roof", "Preferences", "Result"];
  const stepTitles = locale === "tr"
    ? ["Tüketiminizi belirtin", "Çatınızı tanımlayın", "Kullanımınızı tamamlayın", resultsRevealed ? "Hesabınız hazır" : "Sonucunuzu görüntüleyin"]
    : ["Tell us your usage", "Describe your roof", "Complete your preferences", resultsRevealed ? "Your estimate is ready" : "View your estimate"];
  const stepDescriptions = locale === "tr"
    ? ["Fatura veya tüketim tutarınızı ve şehrinizi seçin.", "Kullanılabilir alanı, yönü ve eğimi belirtin.", "Gündüz kullanımınızı ve batarya tercihinizi seçin.", resultsRevealed ? "Seçimlerinizi ve tahmini sonuçları birlikte inceleyin." : "Hesabınızı görmek için iletişim bilgilerinizi bırakın."]
    : ["Enter your bill or consumption and select your city.", "Set the available area, direction and pitch.", "Choose daytime usage and battery storage.", resultsRevealed ? "Review your choices and estimated results together." : "Leave your contact details to view your estimate."];

  const leadMessage = locale === "tr"
    ? `Hesaplayıcı: ${roofArea} m² çatı, ${t(ORIENTATION_KEY[orientation])}, ${t(PITCH_KEY[pitch])}, gündüz kullanım ${fmtPct(dayUse)}, batarya ${batteryKwh === 0 ? t("batteryNone") : `${batteryKwh} kWh`}.`
    : `Calculator: ${roofArea} m² roof, ${t(ORIENTATION_KEY[orientation])}, ${t(PITCH_KEY[pitch])}, daytime use ${fmtPct(dayUse)}, battery ${batteryKwh === 0 ? t("batteryNone") : `${batteryKwh} kWh`}.`;

  const goNext = () => {
    if (step === 0 && (!cityId || !Number.isFinite(num) || num <= 0)) {
      setShowStepError(true);
      return;
    }
    setShowStepError(false);
    setStep((current) => Math.min(3, current + 1));
  };

  return (
    <div className={clsx(styles.wrap, step < 3 || !resultsRevealed ? styles.wizardMode : styles.summaryMode)}>
      <div className={styles.form}>
        <ol className={styles.steps} aria-label={locale === "tr" ? "Hesaplama adımları" : "Estimate steps"}>
          {stepLabels.map((label, index) => (
            <li key={label} className={clsx(index === step && styles.stepCurrent, index < step && styles.stepDone)}>
              <button type="button" onClick={() => step < 3 && index < step && setStep(index)} disabled={index > step || (step === 3 && index < step)} aria-current={index === step ? "step" : undefined}>
                <span>{index + 1}</span>{label}
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.formHeading}>
          <h2>{stepTitles[step]}</h2>
          <p>{stepDescriptions[step]}</p>
          {step === 3 && resultsRevealed && (
            <button type="button" className={styles.recalculateButton} onClick={() => setStep(0)}>
              {locale === "tr" ? "Yeniden hesapla" : "Recalculate"}
            </button>
          )}
        </div>

        {step === 0 && <div className={styles.stepPanel}>
          {fromDemo && <p className={styles.demoNote}>{locale === "tr" ? "Ana sayfadaki seçiminiz aktarıldı." : "Your homepage selection was carried over."}</p>}
          <div className={styles.toggle} role="tablist" aria-label={t("modeLabel")}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "bill"}
            className={clsx(styles.toggleBtn, mode === "bill" && styles.toggleActive)}
            onClick={() => setMode("bill")}
          >
            {t("modeBill")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "consumption"}
            className={clsx(styles.toggleBtn, mode === "consumption" && styles.toggleActive)}
            onClick={() => setMode("consumption")}
          >
            {t("modeConsumption")}
          </button>
          </div>

          <label className={styles.label}>
          {mode === "bill" ? t("billLabel") : t("consumptionLabel")}
          <div className={styles.inputRow}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === "bill" ? "1.500" : "600"}
            />
            <span className={styles.unit}>{mode === "bill" ? t("unitBill") : t("unitKwh")}</span>
          </div>
          </label>

          <div className={styles.label}>
          <span>{t("cityLabel")}</span>
          <CalculatorSelect
            className={styles.calculatorSelect}
            value={cityId}
            onChange={setCityId}
            label={t("cityLabel")}
            placeholder={t("cityPlaceholder")}
            options={CITY_OPTIONS}
          />
          </div>
          {showStepError && <p className={styles.stepError} role="alert">{locale === "tr" ? "Devam etmek için geçerli bir değer ve şehir seçin." : "Enter a valid value and select a city to continue."}</p>}
        </div>}

        {step === 1 && <div className={styles.stepPanel}>
          <label className={styles.label}>
          <span className={styles.rangeHead}>
            {t("roofAreaLabel")}
            <span className={styles.rangeValue}>{roofArea} m²</span>
          </span>
          <input
            type="range"
            className={styles.range}
            min={10}
            max={120}
            step={2}
            value={roofArea}
            onChange={(e) => setRoofArea(Number(e.target.value))}
            aria-label={t("roofAreaLabel")}
          />
          <span className={styles.rangeHint}>
            {t("roofCapacity", { count: capacity })}
          </span>
          </label>
          <div className={styles.fieldGrid}>
          <label className={styles.label}>
            {t("orientationLabel")}
            <Segmented
              value={orientation}
              options={ORIENTATIONS}
              onChange={setOrientation}
              format={(o) => t(ORIENTATION_KEY[o])}
              label={t("orientationLabel")}
            />
          </label>
          <label className={styles.label}>
            {t("pitchLabel")}
            <Segmented
              value={pitch}
              options={ROOF_PITCHES}
              onChange={setPitch}
              format={(p) => t(PITCH_KEY[p])}
              label={t("pitchLabel")}
            />
          </label>
          </div>
        </div>}

        {step === 2 && <div className={styles.stepPanel}>
          <label className={styles.label}>
          <span className={styles.rangeHead}>
            {t("dayUseLabel")}
            <span className={styles.rangeValue}>{fmtPct(dayUse)}</span>
          </span>
          <input
            type="range"
            className={styles.range}
            min={20}
            max={80}
            step={5}
            value={dayUse}
            onChange={(e) => setDayUse(Number(e.target.value))}
            aria-label={t("dayUseLabel")}
          />
          <span className={styles.rangeHint}>{t("dayUseHint")}</span>
          </label>

          <label className={styles.label}>
          {t("batteryLabel")}
          <Segmented
            value={batteryKwh}
            options={BATTERY_OPTIONS}
            onChange={setBatteryKwh}
            format={(v) => (v === 0 ? t("batteryNone") : `${v} kWh`)}
            label={t("batteryLabel")}
          />
          </label>
        </div>}

        {step === 3 && !resultsRevealed && (
          <CalculatorLeadGate
            city={cityName(cityId)}
            bill={mode === "bill" ? String(Math.round(num)) : `${Math.round(num)} kWh/ay`}
            message={leadMessage}
            onBack={() => setStep(2)}
            onSuccess={() => setResultsRevealed(true)}
          />
        )}

        {step === 3 && resultsRevealed && <div className={styles.selectionSummary}>
          <div><span>{stepLabels[0]}</span><strong>{mode === "bill" ? `${fmt(num)} ${t("unitBill")}` : `${fmt(num)} ${t("unitKwh")}`} · {cityName(cityId)}</strong></div>
          <div><span>{stepLabels[1]}</span><strong>{roofArea} m² · {t(ORIENTATION_KEY[orientation])} · {t(PITCH_KEY[pitch])}</strong></div>
          <div><span>{stepLabels[2]}</span><strong>{fmtPct(dayUse)} · {batteryKwh === 0 ? t("batteryNone") : `${batteryKwh} kWh`}</strong></div>
        </div>}

        {step < 3 && <div className={styles.stepActions}>
          {step > 0 && <button type="button" className={styles.backButton} onClick={() => setStep((current) => current - 1)}>{locale === "tr" ? "Geri" : "Back"}</button>}
          <button type="button" className={styles.nextButton} onClick={goNext}>{step === 2 ? (locale === "tr" ? "Son adıma geç" : "Continue") : (locale === "tr" ? "Devam et" : "Continue")}</button>
        </div>}
        {step < 3 && <p className={styles.note}>{t("note")}</p>}
      </div>

      <div className={styles.scene}>
        <div className={styles.sceneHeading}>
          <h1>{t("title")}</h1>
          <p>{locale === "tr" ? "Çatınızı keşfedin, potansiyelinizi görün." : "Explore your roof. See its potential."}</p>
        </div>
        <RoofSim3D
          installed={result ? result.panelsInstalled : 0}
          max={capacity}
          roofAreaM2={roofArea}
          pitch={pitch}
          orientation={orientation}
          batteryKwh={batteryKwh}
          cards={resultsRevealed ? simCards : undefined}
        />
        <p className={styles.simCaption}>
          {resultsRevealed && result
            ? t("simInstalled", {
                recommended: result.panelsNeeded,
                capacity: result.panelsMax,
                kwp: fmt(result.systemKwp, 1),
              })
            : (locale === "tr" ? "Panel yerleşimi seçimlerinize göre güncellenir." : "Panel placement updates with your selections.")}
        </p>
        <p className={styles.note}>{locale === "tr" ? "Bina ve panel yerleşimi temsilidir; hesaplama kullanılabilir çatı alanına dayanır." : "The building and panel layout are illustrative; the estimate uses the available roof area."}</p>
      </div>
      {resultsRevealed && <div className={styles.result}>
        {result ? (
          <>
            {result.roofLimited && (
              <p className={styles.limited}>
                {t("roofLimited", {
                  needed: result.panelsNeeded,
                  area: result.roofAreaNeededM2,
                })}
              </p>
            )}
            <div className={styles.gauges}>
              <Gauge
                pct={Math.min(1, result.consumptionCoverageRatio)}
                value={fmtPct(Math.min(100, result.consumptionCoverageRatio * 100))}
                label={t("coverageLabel")}
              />
              <Gauge
                pct={Math.min(1, result.selfConsumptionRatio)}
                value={fmtPct(Math.min(100, result.selfConsumptionRatio * 100))}
                label={t("selfConsumptionLabel")}
              />
              <Metric label={t("paybackShort")} value={`${fmt(result.paybackYears, 1)} ${t("years")}`} />
            </div>
            <div className={styles.metrics}>
              <Metric
                label={t("costLabel")}
                value={`${fmtTL(result.costLow)} - ${fmtTL(result.costHigh)}`}
              />
              <Metric label={t("annualSavingsLabel")} value={fmtTL(result.annualSavings)} highlight />
              <Metric label={t("savings25Label")} value={fmtTL(result.savings25yr)} />
              <Metric label={t("co2Label")} value={`${fmt(result.co2Savings)} kg`} />
            </div>
            <div className={styles.resultFooter}>
              <p className={styles.warning}>{t("warning")}</p>
              <Link
                href={{
                  pathname: "/contact",
                  query: {
                    city: cityName(cityId),
                    bill: mode === "bill" ? String(Math.round(num)) : "",
                  },
                }}
                className={styles.cta}
              >
                {t("cta")} <IconArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className={styles.empty}>{t("emptyState")}</div>
        )}
      </div>}
    </div>
  );
}
