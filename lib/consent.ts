/**
 * Cookie consent record, exposed as an external store.
 *
 * Storage is localStorage, not a cookie. The point of the banner is that
 * nothing beyond the strictly necessary is written before the visitor has
 * chosen, and writing a cookie in order to ask about cookies undercuts that.
 * The consequence is that consent is only readable on the client, so anything
 * it gates has to be client-rendered. That is what ConsentGate is for.
 *
 * KVKK's cookie guidance (and the GDPR position it follows) turns on three
 * things this module encodes: nothing optional runs before a choice, refusing
 * is exactly as easy as accepting, and the choice can be withdrawn later. The
 * default below is therefore refusal, not absence of an answer.
 */

export const CONSENT_CATEGORIES = ["analytics", "marketing"] as const;

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

/** Strictly necessary cookies are not represented here: they are not optional. */
export type Consent = Record<ConsentCategory, boolean>;

export const CONSENT_DENIED: Consent = { analytics: false, marketing: false };
export const CONSENT_GRANTED: Consent = { analytics: true, marketing: true };

/**
 * Bump when the categories change or a new vendor lands in an existing one.
 * A stored record from an older version is treated as no answer, so everyone
 * is asked again rather than silently carried over to a policy they never saw.
 */
export const CONSENT_VERSION = 1;

const STORAGE_KEY = "minada.consent";

/** Fired on window after every save, for anything outside React. */
export const CONSENT_EVENT = "minada:consent";

type StoredConsent = Consent & { version: number };

export type ConsentSnapshot = {
  consent: Consent;
  /** True once the visitor has answered. Its absence is what shows the banner. */
  decided: boolean;
  /**
   * False for the server render and the hydrating render. Everything the
   * consent controls waits on this: the stored answer exists only on the
   * client, so acting before it is read would either flash the banner at
   * someone who already answered or run a script they refused.
   */
  ready: boolean;
};

const SERVER_SNAPSHOT: ConsentSnapshot = {
  consent: CONSENT_DENIED,
  decided: false,
  ready: false,
};

/**
 * Cached because useSyncExternalStore compares snapshots by reference: handing
 * back a fresh object on every read would loop forever. Cleared on write and on
 * a storage event, which are the only two ways the answer can change.
 */
let cached: ConsentSnapshot | null = null;
const listeners = new Set<() => void>();

function readStored(): Consent | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode, or storage blocked outright. No record means no consent,
    // which is the safe reading.
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return null;
  }
}

export function getConsentSnapshot(): ConsentSnapshot {
  if (!cached) {
    const stored = readStored();
    cached = stored
      ? { consent: stored, decided: true, ready: true }
      : { consent: CONSENT_DENIED, decided: false, ready: true };
  }
  return cached;
}

export function getServerConsentSnapshot(): ConsentSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  // Withdrawing consent in one tab should take effect in the others.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cached = null;
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function saveConsent(consent: Consent): void {
  const record: StoredConsent = { ...consent, version: CONSENT_VERSION };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Nothing to do: the visitor keeps the refusal default for this page view
    // and will be asked again next time.
  }
  cached = { consent, decided: true, ready: true };
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
}
