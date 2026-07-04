"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./EnergyLine.module.scss";
import { buildWaveRoute, toWavePath } from "./energyPath";

const READ_LINE = 0.55; // paint head tracks this fraction of the viewport

/**
 * "Energy line" — a single wave that flows down the page center and is
 * painted (gold up top, cyan below) as the reader scrolls, a glowing spark
 * riding the paint head. It renders BEHIND section content (section inners
 * sit at z:2, the overlay at z:1), so it only shows over section backgrounds.
 * Purely decorative: measured and drawn on the client, absent without JS,
 * static & fully painted under reduced motion.
 */
export function EnergyLine({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const paintRef = useRef<SVGPathElement>(null);
  const sparkRef = useRef<SVGGElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const track = trackRef.current;
    const glow = glowRef.current;
    const paint = paintRef.current;
    const spark = sparkRef.current;
    const grad = gradRef.current;
    if (!wrap || !svg || !track || !glow || !paint || !spark || !grad) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let total = 0;
    let samples: { len: number; y: number }[] = [];
    let raf = 0;

    // Painted length whose endpoint sits at overlay-space y. The route only
    // ever travels down, so sampled y is monotonic → binary search.
    const lenAtY = (y: number) => {
      if (!samples.length || y <= samples[0].y) return 0;
      if (y >= samples[samples.length - 1].y) return total;
      let lo = 0;
      let hi = samples.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].y < y) lo = mid + 1;
        else hi = mid;
      }
      return samples[lo].len;
    };

    const build = () => {
      const wrapRect = wrap.getBoundingClientRect();
      const w = Math.round(wrapRect.width);
      const h = Math.round(wrapRect.height);
      const boxes = Array.from(wrap.querySelectorAll(":scope > section")).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top - wrapRect.top,
          bottom: r.bottom - wrapRect.top,
          left: r.left - wrapRect.left,
          right: r.right - wrapRect.left,
        };
      });
      const pts = buildWaveRoute(boxes, window.innerWidth);
      const d = toWavePath(pts);

      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      track.setAttribute("d", d);
      glow.setAttribute("d", d);
      paint.setAttribute("d", d);
      total = d ? paint.getTotalLength() : 0;

      samples = [];
      if (total) {
        const step = Math.max(6, total / 600);
        for (let l = 0; l < total; l += step) {
          samples.push({ len: l, y: paint.getPointAtLength(l).y });
        }
        samples.push({ len: total, y: paint.getPointAtLength(total).y });
      }

      // Gold holds through the hero, then hands off to cyan just below it.
      const heroEnd = h ? (boxes[0]?.bottom ?? h * 0.2) / h : 0.2;
      grad.setAttribute("y2", `${h}`);
      const stops = grad.children;
      (stops[1] as SVGStopElement | undefined)?.setAttribute("offset", heroEnd.toFixed(3));
      (stops[2] as SVGStopElement | undefined)?.setAttribute(
        "offset",
        Math.min(1, heroEnd + 0.08).toFixed(3)
      );

      paint.style.strokeDasharray = `${total}`;
      glow.style.strokeDasharray = `${total}`;
      if (reduced) {
        paint.style.strokeDashoffset = "0";
        glow.style.strokeDashoffset = "0";
      }
    };

    const update = () => {
      if (reduced) return;
      // Self-heal: if we were built while hidden (zero-size), rebuild once
      // real dimensions exist — cheaper than trusting every resize signal.
      if (!total && wrap.clientWidth > 0) build();
      if (!total) return;
      const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
      const targetY = window.scrollY + window.innerHeight * READ_LINE - wrapTop;
      const len = lenAtY(targetY);
      const off = total - len;
      paint.style.strokeDashoffset = `${off}`;
      glow.style.strokeDashoffset = `${off}`;

      spark.toggleAttribute("data-on", len > 1 && len < total - 1);
      if (len > 0) {
        const pt = paint.getPointAtLength(len);
        for (const c of Array.from(spark.children) as SVGCircleElement[]) {
          c.setAttribute("cx", pt.x.toFixed(1));
          c.setAttribute("cy", pt.y.toFixed(1));
        }
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const rebuild = () => {
      build();
      update();
    };

    build();
    update();
    const ro = new ResizeObserver(rebuild);
    ro.observe(wrap);
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", rebuild);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", rebuild);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      {children}
      <svg ref={svgRef} className={styles.overlay} aria-hidden="true">
        <defs>
          <linearGradient
            ref={gradRef}
            id="energy-grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2="1000"
          >
            <stop offset="0" className={styles.gGold} />
            <stop offset="0.2" className={styles.gGoldEnd} />
            <stop offset="0.28" className={styles.gVolt} />
          </linearGradient>
          <radialGradient id="energy-halo">
            <stop offset="0" className={styles.gHalo0} />
            <stop offset="1" className={styles.gHalo1} />
          </radialGradient>
        </defs>
        <path ref={trackRef} className={styles.track} />
        <path ref={glowRef} className={styles.glow} stroke="url(#energy-grad)" />
        <path ref={paintRef} className={styles.paint} stroke="url(#energy-grad)" />
        <g ref={sparkRef} className={styles.spark}>
          <circle r="16" fill="url(#energy-halo)" />
          <circle className={styles.core} r="3.2" />
        </g>
      </svg>
    </div>
  );
}
