"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconStar } from "@/components/ui/icons";
import styles from "./Proof.module.scss";

export type ProofQuote = {
  id: string;
  quote: string;
  name: string;
  /** Out of five. Nobody was asked for a score; see Proof.tsx. */
  rating: number;
};

const AUTOPLAY_MS = 6500;

/* Two quotes at a time on wide cards, swiped or stepped with the pills
   above them. The strip is a native scroll-snap container, so a touch
   swipe, a trackpad and the keyboard all work without any of it being
   scripted; the pills only read the strip's scroll position back and
   scroll it on a click. That keeps the whole thing working before
   hydration and with the script gone: the quotes are simply a scrollable
   row.

   It also advances on its own every few seconds, and stops for good the
   moment the reader touches it, points at it or tabs into it: an autoplay
   that keeps stealing the quote you are halfway through is worse than no
   autoplay at all. */
export function ProofQuotes({ quotes, label }: { quotes: ProofQuote[]; label: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const reduce = useRef(false);

  // Card width plus the gap: the step the strip snaps to.
  const strideOf = (el: HTMLUListElement) => {
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return 0;
    return card.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
  };

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const stride = strideOf(el);
    if (!stride) return;
    setActive(Math.round(el.scrollLeft / stride));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const stride = strideOf(el);
    if (!stride) return;
    el.scrollTo({ left: i * stride, behavior: reduce.current ? "auto" : "smooth" });
  };

  // Autoplay, unless the reader has taken hold of the strip, the tab is in
  // the background, or they asked for less motion. It wraps back to the
  // first card once the last one has been on screen.
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (held || reduce.current || quotes.length < 2) return;
    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || document.visibilityState !== "visible") return;
      const stride = strideOf(el);
      if (!stride) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
      el.scrollTo({
        left: atEnd ? 0 : el.scrollLeft + stride,
        behavior: reduce.current ? "auto" : "smooth",
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [held, quotes.length]);

  return (
    <div
      className={styles.quotes}
      onPointerDown={() => setHeld(true)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHeld(true);
      }}
      onFocusCapture={() => setHeld(true)}
      onTouchStart={() => setHeld(true)}
    >
      <div className={styles.pills} role="tablist" aria-label={label}>
        {quotes.map((q, i) => (
          <button
            key={q.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={q.name}
            className={clsx(styles.pill, i === active && styles.pillOn)}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <ul ref={trackRef} className={styles.track} aria-label={label} tabIndex={0}>
        {quotes.map((q) => (
          <li key={q.id} className={styles.slide}>
            <figure className={styles.quote}>
              <div className={styles.stars} role="img" aria-label={`${q.rating}/5`}>
                {Array.from({ length: q.rating }).map((_, i) => (
                  <IconStar key={i} size={15} />
                ))}
              </div>
              <blockquote className={styles.quoteText}>
                <p>{q.quote}</p>
              </blockquote>
              <figcaption className={styles.person}>
                <span className={styles.monogram} aria-hidden="true">
                  {q.name.trim().charAt(0)}
                </span>
                <span className={styles.personName}>{q.name}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
