"use client";

import { useState, type ComponentType } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ScrollTopLink } from "@/components/ui/ScrollTopLink";
import {
  IconBattery,
  IconBuilding,
  IconEvCharge,
  IconHeatPump,
  IconHome,
  IconSolar,
} from "@/components/ui/icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./MobileNav.module.scss";

type Item = { href: StaticPathname; label: string; key: string };
type Group = { title?: string; items: Item[] };

// Nav message key -> iş kolu / kitle ikonu. Menüde asıl hedefler bunlar,
// ikon onları ikincil sayfalardan bir bakışta ayırıyor.
const ICONS: Record<string, ComponentType<{ size?: number }>> = {
  line_ges: IconSolar,
  line_bess: IconBattery,
  line_heatpump: IconHeatPump,
  line_evcharge: IconEvCharge,
  solutionsHome: IconHome,
  solutionsBusiness: IconBuilding,
};

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
  const close = () => setOpen(false);

  // Başlıklı gruplar ana liste; başlıksız grup (Ana Sayfa, Hakkımızda, …)
  // altta küçük bir küme olarak toplanır.
  const primary = groups.filter((g) => g.title);
  const secondary = groups.filter((g) => !g.title).flatMap((g) => g.items);

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
              <Logo onClick={close} />
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
            {primary.map((g) => (
              <div key={g.title} className={styles.group}>
                <span className={styles.groupTitle}>{g.title}</span>
                {g.items.map((i) => {
                  const Icon = ICONS[i.key];
                  return (
                    <Link key={i.href} href={i.href} className={styles.link} onClick={close}>
                      {Icon ? (
                        <span className={styles.linkIcon} aria-hidden="true">
                          <Icon size={19} />
                        </span>
                      ) : null}
                      {i.label}
                    </Link>
                  );
                })}
              </div>
            ))}

            {secondary.length > 0 && (
              <div className={styles.secondary}>
                {secondary.map((i) =>
                  i.href === "/" ? (
                    <ScrollTopLink key={i.href} href={i.href} className={styles.subLink} onClick={close}>
                      {i.label}
                    </ScrollTopLink>
                  ) : (
                    <Link key={i.href} href={i.href} className={styles.subLink} onClick={close}>
                      {i.label}
                    </Link>
                  ),
                )}
              </div>
            )}
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
