// Local
import { MembershipFlowProgress } from '../../features/membershipForm';
import { storedValue } from '../../lib/storage';
import { MembershipEligibility } from '../../repositories/publicForms';

export type Phase = 'identification' | 'form' | 'done';

interface MembershipInterestProgress {
  phase: Phase;
  eligibility: MembershipEligibility | null;
  alreadySubmitted?: boolean;
}

export const interestProgress = storedValue<MembershipInterestProgress>('membership-interest-progress', 'session');
export const interestFormProgress = storedValue<MembershipFlowProgress>('membership-interest-form', 'session');
