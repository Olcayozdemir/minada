"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONSENT_CATEGORIES, CONSENT_DENIED, CONSENT_GRANTED, type Consent } from "@/lib/consent";
import { useConsent } from "./ConsentProvider";
import styles from "./CookieConsent.module.scss";

/**
 * A cookie, with a bite out of it. The one place on this site where a drawing
 * beats a photograph: the banner is a chore everybody recognises, and saying so
 * lightly is friendlier than dressing it up. Two colours off the brand ramp, no
 * outline, no shading, so it reads at 34px and stays out of the way.
 */
function CookieMark() {
  // The banner stays mounted behind the dialog, so both marks are in the
  // document at once and cannot share a mask id.
  const id = useId();
  return (
    <svg className={styles.mark} viewBox="0 0 34 34" aria-hidden="true" focusable="false">
      <mask id={id}>
        <rect width="34" height="34" fill="#000" />
        <circle cx="17" cy="17" r="16" fill="#fff" />
        <circle cx="31" cy="6" r="7" fill="#000" />
      </mask>
      <g mask={`url(#${id})`}>
        <circle cx="17" cy="17" r="16" fill="var(--gold-300)" />
        <circle cx="11" cy="12" r="2.6" fill="var(--gold-700)" />
        <circle cx="21" cy="20" r="2.2" fill="var(--gold-700)" />
        <circle cx="12" cy="23" r="1.9" fill="var(--gold-700)" />
        <circle cx="24" cy="12" r="1.6" fill="var(--gold-700)" />
      </g>
    </svg>
  );
}

/**
 * The banner and its preferences dialog.
 *
 * Accept and refuse are one button each, the same size, side by side, in the
 * same visual weight. That is not decoration: a refusal buried a click deeper
 * than acceptance is the specific pattern KVKK's cookie guidance rules out, so
 * the two have to stay symmetrical if anyone restyles this.
 *
 * Closing the banner without choosing is deliberately not offered. There is no
 * dismiss control, and no choice is recorded until a button is pressed, so a
 * visitor who ignores it keeps the refusal default.
 */
export function CookieConsent() {
  const t = useTranslations("Consent");
  const { consent, decided, ready, save, settingsOpen, openSettings, closeSettings } = useConsent();
  const bannerRef = useRef<HTMLDivElement>(null);

  const showBanner = ready && !decided;

  // The banner covers the bottom of a phone screen, and the WhatsApp button
  // lives there. Publishing its measured height lets the widget step over it
  // rather than either of them guessing at the other's size.
  useEffect(() => {
    const el = bannerRef.current;
    const root = document.documentElement;
    if (!showBanner || !el) {
      root.style.removeProperty("--consent-h");
      return;
    }
    const set = () => root.style.setProperty("--consent-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--consent-h");
    };
  }, [showBanner]);

  return (
    <>
      {showBanner ? (
        <div
          ref={bannerRef}
          className={styles.banner}
          role="region"
          aria-label={t("title")}
        >
          <div className={styles.copy}>
            <p className={styles.title}>
              <CookieMark />
              {t("title")}
            </p>
            <p className={styles.body}>
              {t("body")}{" "}
              <Link href="/cookies" className={styles.link}>
                {t("policyLink")}
              </Link>
            </p>
          </div>

          {/* Three peers. The banner takes the short labels because the
              choice there is the whole cookie question; the dialog keeps
              "all", where a bare "accept" would read as "accept what I just
              ticked" next to the per-category switches. */}
          <div className={styles.actions}>
            <button type="button" className={styles.choice} onClick={() => save(CONSENT_DENIED)}>
              {t("reject")}
            </button>
            <button type="button" className={styles.choice} onClick={() => save(CONSENT_GRANTED)}>
              {t("accept")}
            </button>
            <button
              type="button"
              className={clsx(styles.choice, styles.customize)}
              onClick={openSettings}
            >
              {t("settings")}
            </button>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <PreferencesDialog current={consent} onSave={save} onClose={closeSettings} />
      ) : null}
    </>
  );
}

function PreferencesDialog({
  current,
  onSave,
  onClose,
}: {
  current: Consent;
  onSave: (next: Consent) => void;
  onClose: () => void;
}) {
  const t = useTranslations("Consent");
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Consent>(current);

  // showModal rather than the open attribute: it is what puts the dialog in the
  // top layer, traps focus and wires Escape, none of which we should rebuild.
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose} aria-labelledby="consent-title">
      <form method="dialog" className={styles.dialogForm}>
        <h2 id="consent-title" className={styles.dialogTitle}>
          <CookieMark />
          {t("prefsTitle")}
        </h2>
        <p className={styles.dialogIntro}>{t("prefsIntro")}</p>

        <ul className={styles.rows}>
          <li className={styles.row}>
            <div className={styles.rowText}>
              <p className={styles.rowTitle}>{t("necessary.title")}</p>
              <p className={styles.rowDesc}>{t("necessary.desc")}</p>
            </div>
            <span className={styles.always}>{t("alwaysOn")}</span>
          </li>

          {CONSENT_CATEGORIES.map((id) => (
            <li key={id} className={styles.row}>
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>{t(`${id}.title`)}</p>
                <p className={styles.rowDesc}>{t(`${id}.desc`)}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={draft[id]}
                  onChange={(e) => setDraft({ ...draft, [id]: e.target.checked })}
                />
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.knob} />
                </span>
                <span className="sr-only">{t(`${id}.title`)}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className={styles.dialogActions}>
          <button
            type="button"
            className={styles.choice}
            onClick={() => onSave(CONSENT_DENIED)}
          >
            {t("rejectAll")}
          </button>
          <button
            type="button"
            className={styles.choice}
            onClick={() => onSave(CONSENT_GRANTED)}
          >
            {t("acceptAll")}
          </button>
          <button type="button" className={styles.save} onClick={() => onSave(draft)}>
            {t("saveChoice")}
          </button>
        </div>
      </form>
    </dialog>
  );
}

/** Footer entry point, so a recorded choice can be changed or withdrawn. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  const t = useTranslations("Consent");
  const { openSettings } = useConsent();
  return (
    <button type="button" className={className} onClick={openSettings}>
      {t("prefsTitle")}
    </button>
  );
}
