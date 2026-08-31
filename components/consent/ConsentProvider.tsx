"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  saveConsent,
  subscribeConsent,
  type Consent,
  type ConsentSnapshot,
} from "@/lib/consent";

type ConsentState = ConsentSnapshot & {
  save: (next: Consent) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const Ctx = createContext<ConsentState | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  // The answer lives in localStorage, which is an external store rather than
  // React state: useSyncExternalStore is what reads it without a hydration
  // mismatch, since React uses the server snapshot while hydrating and swaps in
  // the real one immediately after.
  const snapshot = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  const [settingsOpen, setSettingsOpen] = useState(false);

  const save = useCallback((next: Consent) => {
    saveConsent(next);
    setSettingsOpen(false);
  }, []);

  const value = useMemo<ConsentState>(
    () => ({
      ...snapshot,
      save,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [snapshot, save, settingsOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConsent(): ConsentState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider");
  return ctx;
}
