"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./Proof.module.scss";

export type ProofQuote = {
  id: string;
  quote: string;
  name: string;
};

const AUTOPLAY_MS = 8000;

/* A single real customer voice sits beside a neutral clean-energy photograph.
   Every quote remains in the same grid cell so the longest one reserves the
   panel height and changing slides cannot make the page jump. Autoplay leaves
   enough time to read and waits whenever the reader engages with the panel. */
export function ProofQuotes({
  quotes,
  title,
  label,
  previousLabel,
  nextLabel,
  visualSrc,
}: {
  quotes: ProofQuote[];
  title: string;
  label: string;
  previousLabel: string;
  nextLabel: string;
  visualSrc: string;
}) {
  const [active, setActive] = useState(0);
  const [announcedActive, setAnnouncedActive] = useState<number | null>(null);
  const held = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceMotion.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (quotes.length < 2) return;

    const id = window.setInterval(() => {
      if (held.current || reduceMotion.current || document.visibilityState !== "visible") return;
      setActive((current) => (current + 1) % quotes.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [active, quotes.length]);

  const step = (direction: -1 | 1) => {
    const next = (active + direction + quotes.length) % quotes.length;
    setActive(next);
    setAnnouncedActive(next);
  };

  return (
    <div
      className={styles.quotes}
      role="region"
      aria-label={label}
      onPointerEnter={() => {
        held.current = true;
      }}
      onPointerLeave={() => {
        held.current = false;
      }}
      onTouchStart={() => {
        held.current = true;
      }}
      onTouchEnd={() => {
        held.current = false;
      }}
      onFocusCapture={() => {
        held.current = true;
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) held.current = false;
      }}
    >
      <div className={styles.quotePanel}>
        <div className={styles.quotesHead}>
          <h2 className={styles.quotesTitle}>{title}</h2>
          {quotes.length > 1 ? (
            <div className={styles.quoteTools}>
              <span className={styles.quoteCount} aria-hidden="true">
                {String(active + 1).padStart(2, "0")}
                <span>/</span>
                {String(quotes.length).padStart(2, "0")}
              </span>
              <div className={styles.quoteNav} role="group" aria-label={label}>
                <button
                  type="button"
                  className={`${styles.roundButton} ${styles.previous}`}
                  aria-label={previousLabel}
                  onClick={() => step(-1)}
                >
                  <IconArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className={styles.roundButton}
                  aria-label={nextLabel}
                  onClick={() => step(1)}
                >
                  <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.quoteSlides}>
          {quotes.map((quote, index) => (
            <figure
              key={quote.id}
              className={clsx(styles.quoteSlide, index === active && styles.quoteActive)}
              aria-hidden={index !== active}
            >
              <span className={styles.monogram} aria-hidden="true">
                {quote.name.trim().charAt(0)}
              </span>
              <div className={styles.quoteContent}>
                <blockquote className={styles.quoteText}>
                  <p>{quote.quote}</p>
                </blockquote>
              </div>
              <figcaption className={styles.personName}>{quote.name}</figcaption>
            </figure>
          ))}
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcedActive === null
            ? ""
            : `${announcedActive + 1} / ${quotes.length}: ${quotes[announcedActive]?.name}`}
        </p>
      </div>

      <div className={styles.quoteVisual} aria-hidden="true">
        <Image
          src={visualSrc}
          alt=""
          fill
          sizes="(max-width: 860px) 100vw, 44vw"
          className={styles.quotePhoto}
        />
      </div>
    </div>
  );
}
