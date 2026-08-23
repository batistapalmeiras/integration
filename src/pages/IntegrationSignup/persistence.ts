// Local
import { CohortSchedule, SignupStep } from './types';
import { SignupFormValues } from './validators/schema';

const STORAGE_KEY = 'integration-signup-progress';

interface SignupProgress {
  step: SignupStep;
  phone: string;
  name: string;
  formValues?: Partial<SignupFormValues>;
  result?: CohortSchedule;
}

export function loadSignupProgress(): SignupProgress | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SignupProgress) : null;
  } catch {
    return null;
  }
}

export function saveSignupProgress(progress: SignupProgress) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // sessionStorage unavailable (e.g. private mode) — persistence is best-effort
  }
}
