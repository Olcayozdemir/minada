"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { calculateSolar, CITIES, type CityId } from "@/lib/solar-config";
import { CalculatorSelect } from "./CalculatorSelect";
import styles from "./CalculatorDemo.module.scss";

const RoofSim3D = dynamic(() => import("./RoofSim3D"), { ssr: false });

export function CalculatorDemo() {
  const locale = useLocale();
  const t = useTranslations("Calculator");
  const [bill, setBill] = useState(1500);
  const [city, setCity] = useState<CityId>("antalya");
  const [visible, setVisible] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "200px" });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const result = calculateSolar({ mode: "bill", value: bill, cityId: city, roofAreaM2: 60, orientation: "south", pitch: "moderate", dayUseRatio: 0.5, batteryKwh: 0 })!;
  const fmt = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  return (
    <div ref={host} className={styles.demo}>
      <div className={styles.top}>
        <span>{locale === "tr" ? "Güneş enerjisi potansiyeliniz" : "Your solar energy potential"}</span>
        <CalculatorSelect
          className={styles.citySelect}
          value={city}
          onChange={(value) => setCity(value as CityId)}
          label={t("cityLabel")}
          placeholder={t("cityPlaceholder")}
          options={CITIES.map((item) => ({ value: item.id, label: t(`cities.${item.id}`) }))}
        />
      </div>
      <div className={styles.scene}>
        {visible && <RoofSim3D installed={result.panelsInstalled} max={25} />}
      </div>
      <label className={styles.bill}>
        <span>{t("billLabel")} <strong>{fmt(bill)} TL</strong></span>
        <input aria-label={t("billLabel")} type="range" min={500} max={10000} step={100} value={bill} onChange={(e) => setBill(Number(e.target.value))} />
      </label>
      <div className={styles.stats}>
        <div><span>{t("simCardProduction")}</span><strong>{fmt(result.annualProduction)} <small>kWh</small></strong></div>
        <div><span>{t("annualSavingsLabel")}</span><strong>{fmt(result.annualSavings)} <small>TL</small></strong></div>
      </div>
      <p>{locale === "tr" ? "Örnek senaryo: 60 m² çatı, güney yönü, bataryasız. Sonuçlar tahminidir." : "Example: 60 m² roof, south-facing, no battery. Results are estimates."}</p>
      <Link className={styles.link} href={{ pathname: "/calculator", query: { bill: String(bill), city } }}>{locale === "tr" ? "Bu hesapla devam et" : "Continue with this estimate"} <span aria-hidden="true">↗</span></Link>
    </div>
  );
}
