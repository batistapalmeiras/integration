// Local
import { EntryType } from '../types/church';
import { monthsBefore } from './dates';
import { isDirectSignup } from './origin';

export const RECENT_ACCEPTANCE_MONTHS = 3;

export const isRecentlyAccepted = (acceptedOn: string | null, today: string): boolean =>
  !!acceptedOn && acceptedOn >= monthsBefore(today, RECENT_ACCEPTANCE_MONTHS) && acceptedOn <= today;

interface AcceptanceSource {
  origin: string;
  entryType: EntryType | null;
  councilDate: string | null;
}

export function acceptedOn({ origin, entryType, councilDate }: AcceptanceSource): string | null {
  if (!isDirectSignup(origin)) return councilDate;
  if (entryType !== 'baptism') return null;
  return councilDate;
}
