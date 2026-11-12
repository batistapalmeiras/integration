// Local
import { storedValue } from './storage';

const LEGACY_MEMBERSHIP_KEY = 'membership-interest-phone';

interface VisitorIdentity {
  phone: string;
  name?: string;
}

export interface KnownVisitor {
  phone: string;
  name: string;
}

const identity = storedValue<VisitorIdentity>('visitor-identity');

export function loadKnownVisitor(): KnownVisitor | null {
  const saved = identity.load();
  return saved?.name ? { phone: saved.phone, name: saved.name } : null;
}

export function saveVisitorIdentity(value: VisitorIdentity): void {
  identity.save(value);
}

export function clearVisitorIdentity(): void {
  identity.clear();
  try {
    localStorage.removeItem(LEGACY_MEMBERSHIP_KEY);
  } catch {
    return;
  }
}
