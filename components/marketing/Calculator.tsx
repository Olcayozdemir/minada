"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { CITIES, calculateSolar, type CityId } from "@/lib/solar-config";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./Calculator.module.scss";

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={clsx(styles.metric, highlight && styles.metricHi)}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
  );
}

export function Calculator() {
  const t = useTranslations("Calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<"bill" | "consumption">("bill");
  const [value, setValue] = useState("");
  const [cityId, setCityId] = useState("");

  const num = parseFloat(value.replace(",", "."));
  const result =
    cityId && num > 0 ? calculateSolar({ mode, value: num, cityId: cityId as CityId }) : null;

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

        <p className={styles.note}>{t("note")}</p>
      </div>

      <div className={styles.result}>
        {result ? (
          <>
            <div className={styles.resultHead}>
              <span className={styles.kpiLabel}>{t("systemLabel")}</span>
              <span className={styles.kpiValue}>{fmt(result.systemKwp, 1)} kWp</span>
            </div>
            <div className={styles.metrics}>
              <Metric
                label={t("costLabel")}
                value={`${fmtTL(result.costLow)} – ${fmtTL(result.costHigh)}`}
              />
              <Metric label={t("annualSavingsLabel")} value={fmtTL(result.annualSavings)} highlight />
              <Metric
                label={t("paybackLabel")}
                value={`${fmt(result.paybackYears, 1)} ${t("years")}`}
              />
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
