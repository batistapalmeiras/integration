// The public pages (inscrição na turma, ficha de membresia) have no login:
// the person identifies themselves by WhatsApp number, and that *is* the
// authentication — the lightweight one, next to the Supabase session the
// volunteers use. Keeping it in one place means identifying once covers
// every public page, instead of each form asking for the number again.
//
// localStorage, not sessionStorage: identifying once should still hold days
// later, in a new tab, which is the whole point of not having a login.
const STORAGE_KEY = 'visitor-identity';
// What the Ficha de Interesse page wrote before this store existed. Still
// read so whoever already identified there isn't asked a second time.
const LEGACY_MEMBERSHIP_KEY = 'membership-interest-phone';

export interface VisitorIdentity {
  phone: string;
  name?: string;
}

export function loadVisitorIdentity(): VisitorIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VisitorIdentity;

    const legacyPhone = localStorage.getItem(LEGACY_MEMBERSHIP_KEY);
    return legacyPhone ? { phone: legacyPhone } : null;
  } catch {
    return null;
  }
}

export function saveVisitorIdentity(identity: VisitorIdentity): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // localStorage unavailable (e.g. private mode) — persistence is best-effort
  }
}

export function clearVisitorIdentity(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_MEMBERSHIP_KEY);
  } catch {
    // ignore
  }
}
