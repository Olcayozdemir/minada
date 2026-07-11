import { getTranslations } from "next-intl/server";
import styles from "./BusinessGains.module.scss";

// İşletmem için "Kazancınız" — üç kanıt grafiği (OPEX düşüşü, geri dönüş/başabaş,
// 1–5 MW lisanssız kapasite). Premium palet: derin teal-cyan gradient veri
// çizgisi, altın (marka) pozitif dolgu, navy yapı; gradient alanlar + yumuşak
// glow + ince ızgara. Statik SVG + CSS hover (JS yok). Etiketler i18n'den gelir.

// Faint horizontal grid — premium "dashboard" dokusu.
function Grid({ ys }: { ys: number[] }) {
  return (
    <g>
      {ys.map((y) => (
        <line key={y} x1="30" y1={y} x2="320" y2={y} stroke="var(--ink)" strokeOpacity="0.05" strokeWidth="1" />
      ))}
    </g>
  );
}

export async function BusinessGains() {
  const t = await getTranslations("Segments.business.gains");

  return (
    <>
      {/* Paylaşımlı SVG tanımları — gradientler + glow (id'ler bg- önekli). */}
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="bgLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0e7fa0" />
            <stop offset="1" stopColor="#24b2d6" />
          </linearGradient>
          <linearGradient id="bgGoldArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2a82c" stopOpacity="0.28" />
            <stop offset="1" stopColor="#f2a82c" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="bgTealArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0e7fa0" stopOpacity="0.16" />
            <stop offset="1" stopColor="#0e7fa0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bgInvestArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#12243f" stopOpacity="0.10" />
            <stop offset="1" stopColor="#12243f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bgBandBar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0e7fa0" />
            <stop offset="1" stopColor="#1ca8ce" />
          </linearGradient>
          <filter id="bgGlow" x="-30%" y="-40%" width="160%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.2" floodColor="#0e7fa0" floodOpacity="0.32" />
          </filter>
        </defs>
      </svg>

      <ul className={styles.charts}>
        {/* ── Kart 1 — OPEX ─────────────────────────────────────────── */}
        <li className={styles.card}>
          <p className={styles.chartH}>{t("charts.opex.header")}</p>
          <div className={styles.legend}>
            <span>
              <i className={styles.k} style={{ borderColor: "#8a96a4" }} />
              {t("charts.opex.legendGrid")}
            </span>
            <span>
              <i className={styles.k} style={{ borderColor: "#149dc4" }} />
              {t("charts.opex.legendMinada")}
            </span>
          </div>
          <svg viewBox="0 0 340 150" role="img" aria-label={t("charts.opex.aria")} className={styles.chart}>
            <Grid ys={[50, 75, 100]} />
            <line x1="40" y1="120" x2="320" y2="120" stroke="var(--line)" strokeWidth="1" />
            {/* tasarruf bandı — altın gradient */}
            <path
              d="M40,75 L65.45,74 L90.9,70 L116.36,70 L141.8,62 L167.27,60 L192.7,60 L218.18,52 L243.6,50 L269.09,48 L294.5,40 L320,38 L320,110 L294.5,110 L269.09,109 L243.6,109 L218.18,108 L192.7,108 L167.27,107 L141.8,106 L116.36,104 L90.9,100 L65.45,90 L40,78 Z"
              fill="url(#bgGoldArea)"
            />
            {/* MİNADA → taban — teal gradient */}
            <path
              d="M40,78 L65.45,90 L90.9,100 L116.36,104 L141.8,106 L167.27,107 L192.7,108 L218.18,108 L243.6,109 L269.09,109 L294.5,110 L320,110 L320,120 L40,120 Z"
              fill="url(#bgTealArea)"
            />
            {/* şebeke tarifesi — ince slate */}
            <polyline
              points="40,75 65.45,74 90.9,70 116.36,70 141.8,62 167.27,60 192.7,60 218.18,52 243.6,50 269.09,48 294.5,40 320,38"
              fill="none"
              stroke="#8a96a4"
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* MİNADA — teal-cyan gradient + glow */}
            <polyline
              points="40,78 65.45,90 90.9,100 116.36,104 141.8,106 167.27,107 192.7,108 218.18,108 243.6,109 269.09,109 294.5,110 320,110"
              fill="none"
              stroke="url(#bgLineGrad)"
              strokeWidth="2.75"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#bgGlow)"
            />
            <circle className={styles.dot} cx="320" cy="110" r="4.5" fill="#149dc4" stroke="#fff" strokeWidth="2.2" filter="url(#bgGlow)">
              <title>{t("charts.opex.tipMinada")}</title>
            </circle>
            <circle cx="320" cy="38" r="3.6" fill="#8a96a4" stroke="#fff" strokeWidth="2">
              <title>{t("charts.opex.tipGrid")}</title>
            </circle>
            {/* tasarruf eşiği — altın */}
            <line x1="300" y1="46" x2="300" y2="102" stroke="var(--gold-600)" strokeWidth="1.5" />
            <text className={styles.tGold} x="294" y="80" textAnchor="end">
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
            <Grid ys={[40, 55, 95, 110]} />
            {/* kâr alanı — altın gradient */}
            <path
              d="M170.25,75 L175,73.35 L211.25,59.6 L247.5,46.4 L283.75,33.75 L320,20 L320,75 Z"
              fill="url(#bgGoldArea)"
            />
            {/* yatırım alanı — navy gradient */}
            <path
              d="M30,130 L66.25,114.6 L102.5,99.75 L138.75,86 L170.25,75 L30,75 Z"
              fill="url(#bgInvestArea)"
            />
            <line x1="30" y1="75" x2="320" y2="75" stroke="var(--ink)" strokeWidth="1" strokeOpacity="0.45" />
            <polyline
              points="30,130 66.25,114.6 102.5,99.75 138.75,86 175,73.35 211.25,59.6 247.5,46.4 283.75,33.75 320,20"
              fill="none"
              stroke="url(#bgLineGrad)"
              strokeWidth="2.75"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#bgGlow)"
            />
            {/* başabaş — altın */}
            <line x1="170.25" y1="75" x2="170.25" y2="120" stroke="var(--gold-600)" strokeWidth="1.5" />
            <circle className={styles.dot} cx="170.25" cy="75" r="5" fill="var(--gold)" stroke="#fff" strokeWidth="2.2">
              <title>{t("charts.payback.tipBreakeven")}</title>
            </circle>
            <text className={styles.tGold} x="170.25" y="133" textAnchor="middle">
              {t("charts.payback.breakeven")}
            </text>
            <circle cx="320" cy="20" r="4.5" fill="#149dc4" stroke="#fff" strokeWidth="2.2" filter="url(#bgGlow)">
              <title>{t("charts.payback.tipProfit")}</title>
            </circle>
            <text className={styles.tMut} x="34" y="126">
              {t("charts.payback.investment")}
            </text>
            <text className={styles.tGold} x="316" y="16" textAnchor="end">
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
            <rect x="30" y="66" width="290" height="22" rx="9" fill="var(--sand)" />
            <rect x="78.33" y="66" width="193.34" height="22" rx="9" fill="url(#bgBandBar)" filter="url(#bgGlow)" />
            {/* üst parlaklık */}
            <rect x="80" y="68" width="190" height="7" rx="4" fill="#fff" fillOpacity="0.16" />
            <text className={styles.tWhite} x="175" y="81" textAnchor="middle">
              {t("charts.capacity.band")}
            </text>
            {/* 5 MW sınır — altın */}
            <line x1="271.67" y1="52" x2="271.67" y2="98" stroke="var(--gold-600)" strokeWidth="1.5" />
            <text className={styles.tGold} x="271.67" y="46" textAnchor="middle">
              {t("charts.capacity.limit")}
            </text>
            <g>
              {[30, 78.33, 126.67, 175, 223.33, 271.67, 320].map((x, i) => (
                <g key={x}>
                  <line x1={x} y1="90" x2={x} y2="94" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="1" />
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
