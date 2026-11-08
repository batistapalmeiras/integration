// Local
import { storedValue } from '../../lib/storage';
import { CohortSchedule } from '../../repositories/publicForms';
import { SignupStep } from './types';
import { SignupFormValues } from './validators/schema';

interface SignupProgress {
  step: SignupStep;
  phone: string;
  name: string;
  formValues?: Partial<SignupFormValues>;
  result?: CohortSchedule;
}

export const signupProgress = storedValue<SignupProgress>('integration-signup-progress', 'session');
