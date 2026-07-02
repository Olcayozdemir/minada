"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { IconArrowRight } from "@/components/ui/icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./MobileNav.module.scss";

type Item = { href: StaticPathname; label: string };

export function MobileNav({
  items,
  cta,
  menuLabel,
  closeLabel,
}: {
  items: Item[];
  cta: string;
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className={styles.trigger} aria-label={menuLabel}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <div className={styles.head}>
            <Dialog.Title className={styles.title}>
              <Logo />
              <span className="sr-only">MİNADA</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className={styles.close} aria-label={closeLabel}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <nav className={styles.nav} aria-label="Primary">
            {items.map((i, idx) => (
              <Link key={i.href} href={i.href} className={styles.link} onClick={() => setOpen(false)}>
                <span className={styles.linkNum}>{`0${idx + 1}`}</span>
                {i.label}
                <IconArrowRight size={17} className={styles.linkArrow} />
              </Link>
            ))}
          </nav>

          <div className={styles.footer}>
            <LanguageSwitcher />
            <Button href="/contact" size="lg" className={styles.cta}>
              {cta}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
