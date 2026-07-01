import type { ReactNode } from "react";

export const metadata = {
  title: "MİNADA Studio",
  robots: { index: false, follow: false },
};

// Studio has its own root layout (it lives outside the [locale] tree).
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
