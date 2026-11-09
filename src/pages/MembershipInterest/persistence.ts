// Local
import { storedValue } from '../../lib/storage';
import { MembershipEligibility } from '../../repositories/publicForms';
import { MembershipFormValues } from './schema';

export type Screen = 'identification' | number | 'review' | 'done';

interface MembershipProgress {
  screen: Screen;
  phone: string;
  values?: MembershipFormValues;
  readChapters: string[];
  returnToReview: boolean;
  eligibility: MembershipEligibility | null;
}

export const membershipProgress = storedValue<MembershipProgress>('membership-form-progress', 'session');
