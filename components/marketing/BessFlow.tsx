import { getTranslations } from "next-intl/server";
import styles from "./BessFlow.module.scss";

/**
 * BESS akış diyagramı — "üret, depola, kullan" hikâyesi tek bakışta.
 * Revize dokümanındaki SVG taslağının site tasarım diline çevrilmiş hâli:
 * navy panel, altın üretim hattı, camgöbeği depolama/şebeke hattı.
 */
export async function BessFlow() {
  const t = await getTranslations("Lines.bess.flow");

  const node = (
    x: number,
    y: number,
    title: string,
    sub: string,
    icon: React.ReactNode,
  ) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="230" height="96" rx="16" className={styles.box} />
      <g transform="translate(26 28)" className={styles.icon}>
        {icon}
      </g>
      <text x="76" y="42" className={styles.title}>
        {title}
      </text>
      <text x="76" y="66" className={styles.sub}>
        {sub}
      </text>
    </g>
  );

  return (
    <div className={styles.scroller}>
      <svg
        viewBox="0 0 960 430"
        className={styles.flow}
        role="img"
        aria-label={t("aria")}
      >
      <defs>
        <marker
          id="bess-gold"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="#f2a82c" />
        </marker>
        <marker
          id="bess-volt"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="#29d6ff" />
        </marker>
      </defs>

      {/* Üretim hattı: panel -> inverter -> tüketim */}
      <line x1="278" y1="108" x2="356" y2="108" className={styles.gold} markerEnd="url(#bess-gold)" />
      <line x1="603" y1="108" x2="681" y2="108" className={styles.gold} markerEnd="url(#bess-gold)" />
      {/* Depolama: inverter <-> batarya */}
      <line
        x1="480"
        y1="164"
        x2="480"
        y2="262"
        className={styles.volt}
        markerEnd="url(#bess-volt)"
        markerStart="url(#bess-volt)"
      />
      {/* Sayaç: ev <-> şebeke (mahsuplaşma) */}
      <line
        x1="805"
        y1="164"
        x2="805"
        y2="262"
        className={styles.volt}
        markerEnd="url(#bess-volt)"
        markerStart="url(#bess-volt)"
      />

      {node(
        40,
        60,
        t("solar"),
        t("solarSub"),
        <>
          <circle cx="12" cy="20" r="9" />
          <path d="M12 4v5M12 31v5M-4 20h5M23 20h5M0.7 8.7l3.5 3.5M19.8 27.8l3.5 3.5M23.3 8.7l-3.5 3.5M4.2 27.8l-3.5 3.5" />
        </>,
      )}
      {node(
        365,
        60,
        t("inverter"),
        t("inverterSub"),
        <path d="M14 2 4 22h8l-2 16L22 16h-8z" />,
      )}
      {node(
        690,
        60,
        t("home"),
        t("homeSub"),
        <path d="M2 20 14 8l12 12M6 18v16h16V18" />,
      )}
      {node(
        365,
        270,
        t("battery"),
        t("batterySub"),
        <>
          <rect x="1" y="10" width="24" height="22" rx="4" />
          <path d="M8 6V2M18 6V2M7 21h12" />
        </>,
      )}
      {node(
        690,
        270,
        t("grid"),
        t("gridSub"),
        <path d="M6 36 12 4h4l6 32M4 16h20M6 26h16M2 36h24" />,
      )}
      </svg>
    </div>
  );
}
