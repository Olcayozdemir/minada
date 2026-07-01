"use client";

import { useLocale } from "next-intl";
import clsx from "clsx";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type StaticPathname } from "@/i18n/routing";
import styles from "./LanguageSwitcher.module.scss";

// Switches locale while staying on the current (localized) route.
export function LanguageSwitcher() {
  const pathname = usePathname();
  const active = useLocale();

  return (
    <div className={styles.wrap} role="group" aria-label="Language">
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname as StaticPathname}
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
