// localStorage (not sessionStorage) is deliberate here — the user asked for
// an "eternal session": once someone identifies themselves once, revisiting
// this page later (even a different day/tab) should skip straight past the
// phone step instead of asking again.
const STORAGE_KEY = 'membership-interest-phone';

export function loadSavedPhone(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveSavedPhone(phone: string) {
  try {
    localStorage.setItem(STORAGE_KEY, phone);
  } catch {
    // localStorage unavailable (e.g. private mode) — persistence is best-effort
  }
}

export function clearSavedPhone() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
