// Single source of truth for the blog's "N dk okuma" badge. Both paths feed it
// the same number: Sanity via GROQ's length(pt::text(body)), the static
// fallback via bodyTextLength() below.

// ~1100 chars/min is a rough Turkish/English silent-reading speed (~155 wpm).
export const CHARS_PER_MINUTE = 1100;

// ceil, not round: rounding sent everything under 1650 chars to "1 dk", and the
// whole catalogue sits at 675-1600 chars — so every post showed the same badge.
// Ceil also matches the usual reading-time convention (a 1m25s read says 2 min).
export function readMinutes(chars: number | undefined): number {
  return Math.max(1, Math.ceil((chars ?? 0) / CHARS_PER_MINUTE));
}

type PortableTextBlock = { children?: { text?: string }[] };

// Plain-text length of a Portable Text body, counted the way GROQ's pt::text()
// counts it: children concatenated, blocks joined by a blank line. Keeping the
// separator identical is what lets the Sanity and fallback badges agree.
export function bodyTextLength(body: PortableTextBlock[] | undefined): number {
  if (!body?.length) return 0;
  return body
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n\n").length;
}
