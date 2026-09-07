// Local
import { ContactResult, PersonStatus } from './types';

export interface ContactAttemptOutcome {
  toStatus: PersonStatus;
  clearWhatsAppOpened: boolean;
  noteOverride?: string;
}

// A no-show at the café gets exactly one retry-contact round — "sem
// resposta" archives instead of looping again once that round is used,
// unlike the normal pre-café retry loop, which is unlimited.
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

// A correction to an already-recorded attempt — deliberately simpler than
// resolveContactAttemptOutcome (it doesn't re-check the post-café retry
// flag). Kept exactly as the pre-existing behavior; this extraction isn't
// the place to silently change it.
export function resolveEditedContactStatus(result: ContactResult): PersonStatus {
  return result === 'accepted' ? 'welcome_coffee' : result === 'declined' ? 'archived' : 'retry_contact';
}
