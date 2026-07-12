"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import {
  CITIES,
  calculateSolar,
  panelCapacityForArea,
  type CityId,
} from "@/lib/solar-config";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./Calculator.module.scss";

// WebGL sim is heavy (three.js), so it loads lazily on the client only; the
// placeholder holds its height to avoid layout shift.
const RoofSim3D = dynamic(() => import("./RoofSim3D"), {
  ssr: false,
  loading: () => <div className={styles.simLoading} aria-hidden="true" />,
});

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
        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(238,242,247,0.16)" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r="20"
          fill="none"
          stroke="var(--gold-300)"
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

export function Calculator() {
  const t = useTranslations("Calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<"bill" | "consumption">("bill");
  const [value, setValue] = useState("");
  const [cityId, setCityId] = useState("");
  const [roofArea, setRoofArea] = useState(60);

  const num = parseFloat(value.replace(",", "."));
  const result =
    cityId && num > 0
      ? calculateSolar({ mode, value: num, cityId: cityId as CityId, roofAreaM2: roofArea })
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

  return (
    <div className={styles.wrap}>
      <div className={styles.form}>
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

        <label className={styles.label}>
          {t("cityLabel")}
          <select
            className={styles.select}
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            <option value="">{t("cityPlaceholder")}</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {t(`cities.${c.id}`)}
              </option>
            ))}
          </select>
        </label>

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

        <p className={styles.note}>{t("note")}</p>
      </div>

      <div className={styles.result}>
        <RoofSim3D installed={result ? result.panelsInstalled : 0} max={capacity} />
        <p className={styles.simCaption}>
          {result
            ? t("simInstalled", {
                installed: result.panelsInstalled,
                kwp: fmt(result.systemKwp, 1),
              })
            : t("simIdle", { count: capacity })}
        </p>

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
                pct={Math.min(1, result.annualProduction / result.annualConsumption)}
                value={`%${fmt(
                  Math.min(100, (result.annualProduction / result.annualConsumption) * 100),
                )}`}
                label={t("coverageLabel")}
              />
              <Gauge
                pct={1 - Math.min(1, result.paybackYears / 25)}
                value={`${fmt(result.paybackYears, 1)} ${t("years")}`}
                label={t("paybackShort")}
              />
            </div>
            <div className={styles.metrics}>
              <Metric
                label={t("costLabel")}
                value={`${fmtTL(result.costLow)} – ${fmtTL(result.costHigh)}`}
              />
              <Metric label={t("annualSavingsLabel")} value={fmtTL(result.annualSavings)} highlight />
              <Metric label={t("savings25Label")} value={fmtTL(result.savings25yr)} />
              <Metric label={t("co2Label")} value={`${fmt(result.co2Savings)} kg`} />
            </div>
            <p className={styles.warning}>{t("warning")}</p>
            <Link
              href={{
                pathname: "/contact",
                query: {
                  city: t(`cities.${cityId}`),
                  bill: mode === "bill" ? String(Math.round(num)) : "",
                },
              }}
              className={styles.cta}
            >
              {t("cta")} <IconArrowRight size={16} />
            </Link>
          </>
        ) : (
          <div className={styles.empty}>{t("emptyState")}</div>
        )}
      </div>
    </div>
  );
}
