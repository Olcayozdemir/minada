"use client";

import { useEffect, useState, type ReactNode } from "react";

// Toggles data-scrolled so the header pill can swap from photo-glass to
// light-surface styling once the hero is scrolled past.
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div data-scrolled={scrolled || undefined}>{children}</div>;
}
