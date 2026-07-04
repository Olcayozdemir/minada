"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./HowItWorks.module.scss";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Still "hold" scroll — as a fraction of one screen — before the slide starts
// and after it ends, so the row doesn't lurch into motion the instant it pins,
// nor hand the page off the instant it finishes.
const LEAD_IN = 0.4;
const LEAD_OUT = 0.4;

/**
 * Scroll-driven process steps as a single pinned row.
 *
 * The stage grows tall, the heading + card row pin to the viewport, and
 * vertical scroll slides the row sideways until every step has been seen —
 * only then does the page scroll on. The pin runway equals how far the row
 * overflows, so the horizontal slide follows the wheel ~1:1 at any card count
 * or viewport, and steps brighten as they enter the frame. Without JS or with
 * reduced motion, the row falls back to a native, swipeable scroll strip.
 */
export function HowScrollFx({ heading, children }: { heading: ReactNode; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = stageRef.current;
    const list = listRef.current;
    if (!stage || !list) return;
    stage.setAttribute("data-fx", "");
    let raf = 0;

    // Pin runway = the two hold zones + however far the row overflows its
    // track. Exposed to CSS so the stage reserves exactly that much extra
    // scroll height beyond one screen.
    const measure = () => {
      const shift = Math.max(list.scrollWidth - list.clientWidth, 0);
      const runway = window.innerHeight * (LEAD_IN + LEAD_OUT) + shift;
      stage.style.setProperty("--travel", `${runway}px`);
    };

    const update = () => {
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const shift = Math.max(list.scrollWidth - list.clientWidth, 0);
      // Distance scrolled into the pinned stage. Progress rides only the middle
      // stretch — flat during the lead-in and lead-out holds at each end — so
      // the slide itself still tracks the wheel ~1:1.
      const p = clamp((-rect.top - vh * LEAD_IN) / Math.max(shift, 1), 0, 1);

      list.style.transform = `translate3d(${(-p * shift).toFixed(1)}px, 0, 0)`;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${Math.max(0.02, p).toFixed(3)})`;

      // A step is "on" once it's meaningfully inside the frame.
      for (const c of Array.from(list.children) as HTMLElement[]) {
        const r = c.getBoundingClientRect();
        c.toggleAttribute("data-on", r.left < vw * 0.82 && r.right > vw * 0.18);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      stage.removeAttribute("data-fx");
      stage.style.removeProperty("--travel");
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage}>
      <div className={styles.sticky}>
        {heading}
        <div className={styles.track} aria-hidden="true">
          <div ref={fillRef} className={styles.fill} />
        </div>
        <ol ref={listRef} className={styles.grid}>
          {children}
        </ol>
      </div>
    </div>
  );
}
