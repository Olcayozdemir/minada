"use client";

import { useEffect } from "react";

/**
 * Section entrances, for the whole page, from one observer.
 *
 * The usual way to do this is a CSS rule that hides `[data-reveal]` by default
 * and a script that unhides it. That rule fires before hydration, so a reader
 * who lands mid-page — a shared anchor, a restored scroll position, a slow
 * connection — watches the page blank out and come back. This arms instead: it
 * hides only what is still below the fold, and leaves anything already on
 * screen exactly as the server rendered it. With no script at all, nothing is
 * ever hidden.
 *
 * Which is which is decided by the observer's own first callback rather than
 * by measuring on mount. Measuring on mount reads a page whose images have not
 * landed yet: every section is still bunched near the top, the whole page
 * looks like it is on screen, and the effect quietly never runs. Waiting for
 * `load` costs nothing, because everything it defers is below the fold.
 *
 * `data-reveal` marks a section (Section's inner carries it); the styles live
 * in globals.scss beside the shared keyframes.
 */
export function RevealOnScroll() {
  useEffect(() => {
    let io: IntersectionObserver | null = null;

    const start = () => {
      const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!targets.length) return;

      // The first callback reports every target at once and describes the page
      // as it stands: whatever is on screen then has been seen, and animating
      // it would blink it out from under the reader.
      let primed = false;

      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (!entry.isIntersecting) {
              if (!primed) el.setAttribute("data-reveal-armed", "");
              continue;
            }
            if (primed) {
              el.removeAttribute("data-reveal-armed");
              el.setAttribute("data-reveal-shown", "");
            }
            io?.unobserve(el);
          }
          primed = true;
        },
        // Fire once the section is a little way in, not on its first pixel.
        { rootMargin: "0px 0px -12% 0px" },
      );

      for (const el of targets) io.observe(el);
    };

    if (document.readyState === "complete") {
      start();
      return () => io?.disconnect();
    }
    window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      io?.disconnect();
    };
  }, []);

  return null;
}
