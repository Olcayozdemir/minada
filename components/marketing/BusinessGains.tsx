import { getTranslations } from "next-intl/server";
import styles from "./BusinessGains.module.scss";

// İşletmem için "Kazancınız" — üç kanıt grafiği (OPEX düşüşü, geri dönüş/başabaş,
// 1–5 MW lisanssız kapasite). Grafikler illüstratiftir; etiketler i18n'den gelir
// (Segments.business.gains). Statik SVG + CSS hover (JS yok).
export async function BusinessGains() {
  const t = await getTranslations("Segments.business.gains");

  return (
    <>
      <ul className={styles.charts}>
        {/* ── Kart 1 — OPEX ─────────────────────────────────────────── */}
        <li className={styles.card}>
          <p className={styles.chartH}>{t("charts.opex.header")}</p>
          <div className={styles.legend}>
            <span>
              <i className={styles.k} style={{ borderColor: "var(--slate)" }} />
              {t("charts.opex.legendGrid")}
            </span>
            <span>
              <i className={styles.k} style={{ borderColor: "var(--cyan-line)" }} />
              {t("charts.opex.legendMinada")}
            </span>
          </div>
          <svg viewBox="0 0 340 150" role="img" aria-label={t("charts.opex.aria")} className={styles.chart}>
            <line x1="40" y1="120" x2="320" y2="120" stroke="var(--mist)" strokeWidth="1" />
            <path
              d="M40,75 L65.45,74 L90.9,70 L116.36,70 L141.8,62 L167.27,60 L192.7,60 L218.18,52 L243.6,50 L269.09,48 L294.5,40 L320,38 L320,110 L294.5,110 L269.09,109 L243.6,109 L218.18,108 L192.7,108 L167.27,107 L141.8,106 L116.36,104 L90.9,100 L65.45,90 L40,78 Z"
              fill="var(--sage)"
              fillOpacity="0.15"
            />
            <path
              d="M40,78 L65.45,90 L90.9,100 L116.36,104 L141.8,106 L167.27,107 L192.7,108 L218.18,108 L243.6,109 L269.09,109 L294.5,110 L320,110 L320,120 L40,120 Z"
              fill="var(--cyan-line)"
              fillOpacity="0.10"
            />
            <polyline
              points="40,75 65.45,74 90.9,70 116.36,70 141.8,62 167.27,60 192.7,60 218.18,52 243.6,50 269.09,48 294.5,40 320,38"
              fill="none"
              stroke="var(--slate)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points="40,78 65.45,90 90.9,100 116.36,104 141.8,106 167.27,107 192.7,108 218.18,108 243.6,109 269.09,109 294.5,110 320,110"
              fill="none"
              stroke="var(--cyan-line)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle className={styles.dot} cx="320" cy="110" r="4.5" fill="var(--cyan-bright)" stroke="#fff" strokeWidth="2">
              <title>{t("charts.opex.tipMinada")}</title>
            </circle>
            <circle cx="320" cy="38" r="4" fill="var(--slate)" stroke="#fff" strokeWidth="2">
              <title>{t("charts.opex.tipGrid")}</title>
            </circle>
            <line x1="300" y1="46" x2="300" y2="102" stroke="var(--amber)" strokeWidth="1.5" />
            <text className={styles.tAmber} x="294" y="80" textAnchor="end">
              {t("charts.opex.savings")}
            </text>
            <text className={styles.tMut} x="40" y="138">
              {t("charts.opex.axis")}
            </text>
          </svg>
          <div className={styles.divider} />
          <div className={styles.heading}>{t("g1.stat")}</div>
          <div className={styles.sub}>{t("g1.title")}</div>
          <p className={styles.body}>{t("g1.desc")}</p>
        </li>

        {/* ── Kart 2 — Geri dönüş / başabaş ─────────────────────────── */}
        <li className={styles.card}>
          <p className={styles.chartH}>{t("charts.payback.header")}</p>
          <div className={styles.legend} aria-hidden="true">
            <span className={styles.spacer}>·</span>
          </div>
          <svg viewBox="0 0 340 150" role="img" aria-label={t("charts.payback.aria")} className={styles.chart}>
            <path
              d="M170.25,75 L175,73.35 L211.25,59.6 L247.5,46.4 L283.75,33.75 L320,20 L320,75 Z"
              fill="var(--sage)"
              fillOpacity="0.16"
            />
            <path
              d="M30,130 L66.25,114.6 L102.5,99.75 L138.75,86 L170.25,75 L30,75 Z"
              fill="var(--slate)"
              fillOpacity="0.12"
            />
            <line x1="30" y1="75" x2="320" y2="75" stroke="var(--navy)" strokeWidth="1" strokeOpacity=".5" />
            <polyline
              points="30,130 66.25,114.6 102.5,99.75 138.75,86 175,73.35 211.25,59.6 247.5,46.4 283.75,33.75 320,20"
              fill="none"
              stroke="var(--cyan-line)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <line x1="170.25" y1="75" x2="170.25" y2="120" stroke="var(--amber)" strokeWidth="1.5" />
            <circle className={styles.dot} cx="170.25" cy="75" r="5" fill="var(--amber)" stroke="#fff" strokeWidth="2">
              <title>{t("charts.payback.tipBreakeven")}</title>
            </circle>
            <text className={styles.tAmber} x="170.25" y="133" textAnchor="middle">
              {t("charts.payback.breakeven")}
            </text>
            <circle cx="320" cy="20" r="4.5" fill="var(--cyan-bright)" stroke="#fff" strokeWidth="2">
              <title>{t("charts.payback.tipProfit")}</title>
            </circle>
            <text className={styles.tMut} x="34" y="126">
              {t("charts.payback.investment")}
            </text>
            <text className={styles.tSage} x="316" y="16" textAnchor="end">
              {t("charts.payback.profit")}
            </text>
          </svg>
          <div className={styles.divider} />
          <div className={styles.heading}>{t("g2.stat")}</div>
          <div className={styles.sub}>{t("g2.title")}</div>
          <p className={styles.body}>{t("g2.desc")}</p>
        </li>

        {/* ── Kart 3 — Lisanssız kapasite ───────────────────────────── */}
        <li className={styles.card}>
          <p className={styles.chartH}>{t("charts.capacity.header")}</p>
          <div className={styles.legend} aria-hidden="true">
            <span className={styles.spacer}>·</span>
          </div>
          <svg viewBox="0 0 340 150" role="img" aria-label={t("charts.capacity.aria")} className={styles.chart}>
            <rect x="30" y="66" width="290" height="22" rx="8" fill="var(--mist)" />
            <rect x="78.33" y="66" width="193.34" height="22" rx="8" fill="var(--cyan-line)" />
            <text className={styles.tWhite} x="175" y="81" textAnchor="middle">
              {t("charts.capacity.band")}
            </text>
            <line x1="271.67" y1="52" x2="271.67" y2="98" stroke="var(--amber)" strokeWidth="1.5" />
            <text className={styles.tAmber} x="271.67" y="46" textAnchor="middle">
              {t("charts.capacity.limit")}
            </text>
            <g>
              {[30, 78.33, 126.67, 175, 223.33, 271.67, 320].map((x, i) => (
                <g key={x}>
                  <line x1={x} y1="90" x2={x} y2="94" stroke="var(--slate)" strokeWidth="1" />
                  <text className={styles.tTick} x={x} y="106" textAnchor="middle">
                    {i}
                  </text>
                </g>
              ))}
            </g>
            <text className={styles.tMut} x="175" y="130" textAnchor="middle">
              {t("charts.capacity.foot")}
            </text>
          </svg>
          <div className={styles.divider} />
          <div className={styles.heading}>{t("g3.stat")}</div>
          <div className={styles.sub}>{t("g3.title")}</div>
          <p className={styles.body}>{t("g3.desc")}</p>
        </li>
      </ul>

      <p className={styles.note}>{t("chartsNote")}</p>
    </>
  );
}
