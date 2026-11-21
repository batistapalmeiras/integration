// Local
import { monthsBefore } from './dates';

export const RECENT_ACCEPTANCE_MONTHS = 3;

export const RECENT_ACCEPTANCE_LABELS = {
  recent: `Aceitos nos últimos ${RECENT_ACCEPTANCE_MONTHS} meses`,
} as const;

export type RecentAcceptance = keyof typeof RECENT_ACCEPTANCE_LABELS;

export const isRecentlyAccepted = (acceptedOn: string | null, today: string): boolean =>
  !!acceptedOn && acceptedOn >= monthsBefore(today, RECENT_ACCEPTANCE_MONTHS) && acceptedOn <= today;
