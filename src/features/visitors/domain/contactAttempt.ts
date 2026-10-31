// Local
import { ContactResult, PersonStatus } from './types';

export interface ContactAttemptOutcome {
  toStatus: PersonStatus;
  clearWhatsAppOpened: boolean;
  noteOverride?: string;
}

export function statusAfterContact(result: ContactResult, attendedCoffee: boolean): PersonStatus {
  if (result === 'accepted') return attendedCoffee ? 'pending_signup' : 'welcome_coffee';
  return result === 'declined' ? 'archived' : 'retry_contact';
}

export function resolveContactAttemptOutcome(
  result: ContactResult,
  coffeeRetryUsed: boolean,
  attendedCoffee: boolean,
): ContactAttemptOutcome {
  const exhaustedCoffeeRetry = result === 'no_response' && coffeeRetryUsed;

  return {
    toStatus: exhaustedCoffeeRetry ? 'archived' : statusAfterContact(result, attendedCoffee),
    clearWhatsAppOpened: result === 'no_response' && !exhaustedCoffeeRetry,
    noteOverride: exhaustedCoffeeRetry ? 'Sem resposta na retomada de contato após o café' : undefined,
  };
}
