const STORAGE_KEY = 'visitor-identity';
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
  }
}

export function clearVisitorIdentity(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_MEMBERSHIP_KEY);
  } catch {
  }
}
