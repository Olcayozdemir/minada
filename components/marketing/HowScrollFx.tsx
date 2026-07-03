"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./HowItWorks.module.scss";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Scroll-driven process steps.
 * Desktop: a gold progress line fills as the section crosses the viewport and
 * the steps light up in order. Mobile: the stage grows tall, the content
 * pins, and vertical scroll slides the cards sideways with a subtle
 * cube-like tilt. Without JS or with reduced motion, the static grid stays.
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
    const mq = window.matchMedia("(max-width: 760px)");
    let raf = 0;

    const update = () => {
      const cards = Array.from(list.children) as HTMLElement[];
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;

      if (mq.matches) {
        // Pinned stage: vertical progress drives the horizontal slide.
        const travel = Math.max(stage.offsetHeight - vh, 1);
        const p = clamp(-rect.top / travel, 0, 1);
        const shift = Math.max(list.scrollWidth - list.clientWidth, 0);
        list.style.transform = `translate3d(${(-p * shift).toFixed(1)}px, 0, 0)`;
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${p.toFixed(3)})`;

        const center = window.innerWidth / 2;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          const off = clamp((r.left + r.width / 2 - center) / r.width, -1.2, 1.2);
          c.style.transform = `perspective(900px) rotateY(${(off * -12).toFixed(2)}deg) scale(${(
            1 - Math.abs(off) * 0.05
          ).toFixed(3)})`;
          c.toggleAttribute("data-on", Math.abs(off) < 0.55);
        });
      } else {
        // Viewport-relative runway (independent of the short section height):
        // fills as the section top travels from 85%→15% of the viewport.
        const p = clamp((vh * 0.85 - rect.top) / (vh * 0.7), 0, 1);
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${Math.max(0.02, p).toFixed(3)})`;
        const activeIdx = Math.round(p * (cards.length - 1));
        cards.forEach((c, i) => {
          c.style.transform = "";
          c.toggleAttribute("data-on", i <= activeIdx);
        });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      stage.removeAttribute("data-fx");
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
