import { Bricolage_Grotesque, Fraunces, Manrope } from "next/font/google";

// Display: modern grotesk for headlines and the wordmark.
export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Serif: Fraunces italic supplies the warm gold accent word ("enerjisi.").
export const fontSerif = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Body: humanist sans for running text and UI.
export const fontBody = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
