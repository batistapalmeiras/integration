// Local
import { ContactResult, PersonStatus } from './types';

export interface ContactAttemptOutcome {
  toStatus: PersonStatus;
  clearWhatsAppOpened: boolean;
  noteOverride?: string;
}

export function resolveContactAttemptOutcome(result: ContactResult, coffeeRetryUsed: boolean): ContactAttemptOutcome {
  const exhaustedCoffeeRetry = result === 'no_response' && coffeeRetryUsed;
  const toStatus: PersonStatus =
    result === 'accepted' ? 'welcome_coffee' : result === 'declined' || exhaustedCoffeeRetry ? 'archived' : 'retry_contact';

  return {
    toStatus,
    clearWhatsAppOpened: result === 'no_response' && !exhaustedCoffeeRetry,
    noteOverride: exhaustedCoffeeRetry ? 'Sem resposta na retomada de contato após o café' : undefined,
  };
}

export function resolveEditedContactStatus(result: ContactResult): PersonStatus {
  return result === 'accepted' ? 'welcome_coffee' : result === 'declined' ? 'archived' : 'retry_contact';
}
