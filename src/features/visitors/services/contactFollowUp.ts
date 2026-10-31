// Local
import { attachToNextWelcomeCoffee, getPersonAttendedCoffeeDate, leaveOpenCoffeeSeat } from '../../../domain/cafeSchedule';
import { todayKey } from '../../../domain/dates';
import { PersonStatus } from '../domain/types';

export async function hasAttendedCoffee(personId: string): Promise<boolean> {
  return !!(await getPersonAttendedCoffeeDate(personId));
}

export function fieldsAfterContact(toStatus: PersonStatus): Record<string, unknown> {
  return toStatus === 'pending_signup' ? { class_invite_sent_at: null, signup_window_from: todayKey() } : {};
}

export async function placeAfterContact(personId: string, toStatus: PersonStatus): Promise<void> {
  if (toStatus === 'welcome_coffee') await attachToNextWelcomeCoffee(personId);
  if (toStatus === 'pending_signup') await leaveOpenCoffeeSeat(personId);
}
