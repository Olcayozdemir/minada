"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Translates its children downward at a fraction of the scroll speed, so the
 * hero display type sinks toward the house before the hero leaves the fold.
 */
export function SinkOnScroll({
  children,
  className,
  factor = 0.45,
}: {
  children: ReactNode;
  className?: string;
  factor?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transform = `translateY(${(window.scrollY * factor).toFixed(1)}px)`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [factor]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
