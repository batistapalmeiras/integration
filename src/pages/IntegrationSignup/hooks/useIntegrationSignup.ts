// React
import { useState } from 'react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { CohortSchedule, submitIntegrationSignup } from '../../../repositories/publicForms';
import { SignupFormValues, toSignupAnswers } from '../validators/schema';

export function useIntegrationSignup(initialResult: CohortSchedule | null = null) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CohortSchedule | null>(initialResult);

  const submit = async (phone: string, values: SignupFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const schedule = await submitIntegrationSignup(phone, toSignupAnswers(values));
      setResult(schedule);
      return schedule;
    } catch (e) {
      setError(errorMessage(e));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, result };
}
