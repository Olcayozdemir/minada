"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { BUSINESS_LINES, whatsappLink } from "@/lib/site";
import { IconWhatsapp } from "@/components/ui/icons";
import styles from "./WhatsAppWidget.module.scss";

// Her sayfada sağ altta duran WhatsApp girişi. Konu seçilince sohbet
// ziyaretçinin kendi WhatsApp'ında ön-dolu mesajla açılır; MİNADA tarafında
// mesaj her zamanki hatta düşer (bkz. docs/superpowers/specs/2026-08-12).
// Modal değil: odak hapsi ve scroll kilidi yok, küçük bir popover için ikisi de
// sayfayı gezmeyi engellerdi.
export function WhatsAppWidget() {
  const t = useTranslations("WhatsAppWidget");
  const tNav = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  // Bulunulan iş kolu sayfası listenin başına gelir. usePathname kanonik yolu
  // döndürüyor, BUSINESS_LINES de kanonik yol tutuyor -> düz string eşitliği.
  const lines = [
    ...BUSINESS_LINES.filter((l) => l.href === pathname),
    ...BUSINESS_LINES.filter((l) => l.href !== pathname),
  ];

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.root}>
      {open && (
        <div id={panelId} className={styles.card} role="group" aria-label={t("title")}>
          <div className={styles.head}>
            <span className={styles.title}>{t("title")}</span>
            <button type="button" className={styles.close} onClick={close} aria-label={t("close")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <p className={styles.prompt}>{t("prompt")}</p>

          <div className={styles.items}>
            {lines.map((l, i) => {
              const topic = tNav(`line_${l.id}`);
              return (
                <a
                  key={l.id}
                  ref={i === 0 ? firstItemRef : undefined}
                  href={whatsappLink(t("message", { topic }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.item}
                  onClick={() => setOpen(false)}
                >
                  {topic}
                </a>
              );
            })}
            {/* "Diğer" mesajsız açar; ziyaretçi kendi yazar. */}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.item}
              onClick={() => setOpen(false)}
            >
              {t("other")}
            </a>
          </div>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("title")}
      >
        <IconWhatsapp size={28} />
      </button>
    </div>
  );
}
