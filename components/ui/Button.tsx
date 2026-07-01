import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import styles from "./Button.module.scss";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Internal, locale-aware route (from i18n/routing). */
  href?: ComponentProps<typeof Link>["href"];
  /** Raw external URL (wa.me, tel:, mailto:, absolute http). */
  externalHref?: string;
  newTab?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  externalHref,
  newTab = true,
  onClick,
  type = "button",
  ariaLabel,
}: ButtonProps) {
  const cn = clsx(styles.btn, styles[variant], styles[size], className);

  if (href) {
    return (
      <Link href={href} className={cn} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  if (externalHref) {
    return (
      <a
        href={externalHref}
        className={cn}
        aria-label={ariaLabel}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={cn}>
      {children}
    </button>
  );
}
