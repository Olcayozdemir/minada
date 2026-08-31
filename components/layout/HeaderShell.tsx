"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Toggles data-scrolled so the header pill can swap from photo-glass to
// light-surface styling once the hero is scrolled past. Pages without a
// [data-hero] section have no photo underneath, so they start "scrolled".
//
// It also publishes the header's measured height as --header-h, which --header-clear
// derives from: what #main reserves and what the home hero pulls back up by.
// The token's 84px was a one-line-nav guess: between roughly 1000 and 1200px
// the nav wraps and the header grows to about 97px, so the first section was
// being laid out 13px underneath a fixed bar. Measuring also keeps anchor
// scroll offsets and the sticky FAQ rail honest at those widths.
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasHero = document.querySelector("[data-hero]") !== null;
    const onScroll = () => setScrolled(!hasHero || window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = ref.current?.closest("header");
    if (!el) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--header-h", `${Math.round(el.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--header-h");
    };
  }, []);

  return (
    <div ref={ref} data-scrolled={scrolled || undefined}>
      {children}
    </div>
  );
}
