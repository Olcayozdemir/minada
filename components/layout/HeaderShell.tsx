"use client";

import { useEffect, useState, type ReactNode } from "react";

// Toggles data-scrolled so the header pill can swap from photo-glass to
// light-surface styling once the hero is scrolled past. Pages without a
// [data-hero] section have no photo underneath, so they start "scrolled".
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hasHero = document.querySelector("[data-hero]") !== null;
    const onScroll = () => setScrolled(!hasHero || window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div data-scrolled={scrolled || undefined}>{children}</div>;
}
