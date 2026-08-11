"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ScrollTopLink } from "@/components/ui/ScrollTopLink";
import { IconArrowRight } from "@/components/ui/icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./MobileNav.module.scss";

type Item = { href: StaticPathname; label: string };
type Group = { title?: string; items: Item[] };

export function MobileNav({
  groups,
  cta,
  menuLabel,
  closeLabel,
}: {
  groups: Group[];
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
              <Logo onClick={() => setOpen(false)} />
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
            {groups.map((g, gi) => {
              // Numbering continues across groups.
              const offset = groups.slice(0, gi).reduce((acc, x) => acc + x.items.length, 0);
              return (
                <div key={gi} className={styles.group}>
                  {g.title ? <span className={styles.groupTitle}>{g.title}</span> : null}
                  {g.items.map((i, ii) => {
                    const inner = (
                      <>
                        <span className={styles.linkNum}>
                          {String(offset + ii + 1).padStart(2, "0")}
                        </span>
                        {i.label}
                        <IconArrowRight size={17} className={styles.linkArrow} />
                      </>
                    );
                    // Ana sayfa linki, zaten ana sayfadaysak yukarı kaydırır.
                    return i.href === "/" ? (
                      <ScrollTopLink
                        key={i.href}
                        href={i.href}
                        className={styles.link}
                        onClick={() => setOpen(false)}
                      >
                        {inner}
                      </ScrollTopLink>
                    ) : (
                      <Link
                        key={i.href}
                        href={i.href}
                        className={styles.link}
                        onClick={() => setOpen(false)}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
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
