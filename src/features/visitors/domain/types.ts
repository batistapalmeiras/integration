export { STATUS_META, type Person, type PersonStatus, type StatusTone } from '../../../types/person';

export type ContactResult = 'accepted' | 'declined' | 'no_response';

export const RESULT_LABELS: Record<ContactResult, string> = {
  accepted: 'Aceitou o convite',
  declined: 'Recusou',
  no_response: 'Sem resposta',
};

// Structural shape only — deliberately not importing pages/Visitors's
// zod-inferred form types here (a feature must not depend on a page), but
// every call site passes an RHF-inferred object that already matches this
// shape, so no call site needs to change.
export interface UpdatePersonInput {
  name: string;
  phone: string;
  age?: string;
  email?: string;
}
