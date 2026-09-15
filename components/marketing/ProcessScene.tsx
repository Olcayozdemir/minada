"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./HowItWorks.module.scss";

const MOBILE_ENERGY_PATH = "M710 284 C718.2 291.7 751.3 315.7 759 330 C766.7 344.3 764.5 356.7 756 370 C747.5 383.3 738.5 396.7 708 410 C677.5 423.3 604.3 436.7 573 450 C545 466 480 495 480 535 C480 565 520 590 565 610 C592 623.3 633.8 636.7 657 650 C680.2 663.3 695.7 676.7 704 690 C712.3 703.3 713.7 716.7 707 730 C700.3 743.3 685.5 756.7 664 770 C642.5 783.3 606 796.7 578 810 C550 823.3 518.2 836.7 496 850 C473.8 863.3 454 876.7 445 890 C436 903.3 434.7 916.7 442 930 C449.3 943.3 462.7 956.7 489 970 C515.3 983.3 568 996.7 600 1010 C632 1023.3 661 1036.7 681 1050 C701 1063.3 712.7 1076.7 720 1090 C727.3 1103.3 725.2 1116.7 725 1130 C724.8 1143.3 724.8 1157.2 719 1170 C713.2 1182.8 694.8 1200.8 690 1207";

/** Shared artwork coordinates keep the rigid layers aligned at every size. */
export function ProcessScene({ pauseLabel, playLabel, sceneLabel, stepTitles, children }: {
  pauseLabel: string; playLabel: string; sceneLabel: string; stepTitles: string[]; children: ReactNode;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      scene.dataset.running = String(visible && !document.hidden && !preference.matches);
      setAvailable(!preference.matches);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(scene);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <div ref={sceneRef} className={styles.scene} data-paused={paused} data-running="false">
    <div className={styles.sceneViewport} tabIndex={0} role="region" aria-label={sceneLabel}>
      <div className={styles.sceneStage}>
      <svg className={styles.maquette} viewBox="0 130 1983 610" aria-hidden="true" focusable="false">
        <image href="/images/v2/how/maquette-base-finished.webp" width="1983" height="793" />
        <g className={styles.panelLayer} data-motion="panel">
          {/* Affine alignment to the roof plane of this particular artwork. */}
          <image href="/images/v2/how/maquette-panel.webp" width="1254" height="1254"
            transform="matrix(.170817 .021454 .061739 .183081 390.107 188.842)" />
        </g>
        <g className={styles.truckLayer} data-motion="truck">
          <image href="/images/v2/how/maquette-truck.webp" x="978" y="287" width="247" height="139" />
        </g>
        <svg x="1264" y="175" width="211" height="141" viewBox="0 0 211 141" overflow="visible">
          <g className={styles.boomLayer} data-motion="boom">
            <image href="/images/v2/how/maquette-boom.webp" width="211" height="141" />
          </g>
        </svg>
        <g className={styles.connectors}>
          <path d="M205 610 V690 L165.25 724 V740" />
          <path d="M530 577 V690 L495.75 724 V740" />
          <path d="M822 604 V690 L826.25 724 V740" />
          <path d="M1130 570 V690 L1156.75 724 V740" />
          <path d="M1470 510 V690 L1487.25 724 V740" />
          <path d="M1810 455 V690 L1817.75 724 V740" />
        </g>
      </svg>
      <div className={styles.mobileVisual} aria-hidden="true">
        <Image
          className={styles.mobileMaquette}
          src="/images/v2/how/process-journey-mobile-finished.webp"
          alt=""
          width={1122}
          height={1402}
          sizes="(max-width: 700px) calc(100vw - 32px), 1px"
        />
        <svg className={styles.mobileEnergy} viewBox="0 0 1122 1402" focusable="false">
          <path
            className={styles.mobileEnergyBase}
            d={MOBILE_ENERGY_PATH}
          />
          <path
            className={styles.mobileEnergyPulse}
            pathLength="1"
            d={MOBILE_ENERGY_PATH}
          />
        </svg>
        <ol className={styles.mobileMarkers}>
          {stepTitles.map((title, index) => (
            <li key={title} className={styles.mobileMarker}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {title}
            </li>
          ))}
        </ol>
      </div>
      {children}
      </div>
    </div>
    <div className={styles.sceneToolbar}>
      {available && <button type="button" className={styles.motionToggle}
        aria-label={paused ? playLabel : pauseLabel} aria-pressed={paused}
        onClick={() => setPaused(value => !value)}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          {paused ? <path d="m6 3 11 7-11 7Z" fill="currentColor" /> : <path d="M6 4v12M14 4v12" stroke="currentColor" strokeWidth="3" />}
        </svg>
        <span>{paused ? playLabel : pauseLabel}</span>
      </button>}
    </div>
  </div>;
}
