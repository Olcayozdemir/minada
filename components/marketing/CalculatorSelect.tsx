"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Fragment } from "react";
import clsx from "clsx";
import styles from "./CalculatorSelect.module.scss";

export type CalculatorSelectOption = {
  value: string;
  label: string;
  /** Draw a rule after this option, closing a group at the top of the list. */
  separatorAfter?: boolean;
};

export function CalculatorSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  invalid = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: CalculatorSelectOption[];
  label: string;
  placeholder: string;
  invalid?: boolean;
  className?: string;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        type="button"
        className={clsx(styles.trigger, invalid && styles.invalid, className)}
        aria-label={label}
        aria-invalid={invalid || undefined}
      >
        <span className={clsx(!selected && styles.placeholder)}>{selected?.label ?? placeholder}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m6 8 4 4 4-4" />
        </svg>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} sideOffset={6} align="start">
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <Fragment key={option.value}>
                <DropdownMenu.RadioItem className={styles.item} value={option.value}>
                  <span>{option.label}</span>
                  <DropdownMenu.ItemIndicator className={styles.indicator}>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d="m5 10 3.2 3.2L15 6.5" />
                    </svg>
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
                {option.separatorAfter ? <DropdownMenu.Separator className={styles.separator} /> : null}
              </Fragment>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
