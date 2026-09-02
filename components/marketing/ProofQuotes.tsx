"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./Proof.module.scss";

export type ProofQuote = { id: string; quote: string; name: string };

/* One quote at a time, on a wide card, swiped or stepped with the pills
   above it. The strip is a native scroll-snap container, so a touch swipe,
   a trackpad and the keyboard all work without any of it being scripted;
   the pills only read the strip's scroll position back and scroll it on a
   click. That keeps the whole thing working before hydration and with the
   script gone: the quotes are simply a scrollable row. */
export function ProofQuotes({ quotes, label }: { quotes: ProofQuote[]; label: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * stride, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={styles.quotes}>
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
