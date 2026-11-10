// Local
import { MembershipFlowProgress } from '../../features/membershipForm';
import { storedValue } from '../../lib/storage';

export type Phase = 'cpf' | 'form' | 'done';

export const signupPhase = storedValue<Phase>('membership-signup-phase', 'session');
export const signupFormProgress = storedValue<MembershipFlowProgress>('membership-signup-form', 'session');
