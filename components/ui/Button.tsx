import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./Button.module.scss";

type Variant = "primary" | "secondary" | "ghost" | "glass";
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
  /** Trailing arrow-in-circle motif. */
  withArrow?: boolean;
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
  withArrow = false,
}: ButtonProps) {
  const cn = clsx(styles.btn, styles[variant], styles[size], className);
  const content = (
    <>
      {children}
      {withArrow && (
        <span className={styles.arrow} aria-hidden="true">
          <IconArrowRight size={15} />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn} aria-label={ariaLabel}>
        {content}
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
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={cn}>
      {content}
    </button>
  );
}
