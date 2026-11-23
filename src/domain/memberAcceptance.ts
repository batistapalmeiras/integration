// Local
import { EntryType } from '../types/church';
import { monthsBefore, timestampDateKey } from './dates';
import { isDirectSignup } from './origin';

export const RECENT_ACCEPTANCE_MONTHS = 3;

export const RECENT_ACCEPTANCE_LABELS = {
  recent: `Aceitos nos últimos ${RECENT_ACCEPTANCE_MONTHS} meses`,
} as const;

export type RecentAcceptance = keyof typeof RECENT_ACCEPTANCE_LABELS;

export const isRecentlyAccepted = (acceptedOn: string | null, today: string): boolean =>
  !!acceptedOn && acceptedOn >= monthsBefore(today, RECENT_ACCEPTANCE_MONTHS) && acceptedOn <= today;

interface AcceptanceSource {
  origin: string;
  entryType: EntryType | null;
  councilDate: string | null;
  createdAt: string;
}

export function acceptedOn({ origin, entryType, councilDate, createdAt }: AcceptanceSource): string | null {
  if (!isDirectSignup(origin)) return councilDate;
  if (entryType !== 'baptism') return null;
  return councilDate ?? timestampDateKey(createdAt);
}
