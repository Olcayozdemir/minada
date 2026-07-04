"use client";

import type { ComponentProps } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import styles from "./LanguageSwitcher.module.scss";

type LinkHref = ComponentProps<typeof Link>["href"];

// Switches locale while staying on the current (localized) route. Passing
// `{ pathname, params }` — rather than the bare pathname — lets next-intl
// re-localize dynamic slugs (e.g. /urunler/[category] ↔ /products/[category]);
// a bare string throws "Insufficient params" on parameterized routes.
export function LanguageSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const active = useLocale();

  const href = { pathname, params } as unknown as LinkHref;

  return (
    <div className={styles.wrap} role="group" aria-label="Language">
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={href}
          locale={loc}
          className={clsx(styles.item, loc === active && styles.active)}
          aria-current={loc === active ? "true" : undefined}
        >
          {loc.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
