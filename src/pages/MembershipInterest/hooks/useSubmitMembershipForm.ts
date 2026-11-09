// React
import { useState } from 'react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { MembershipEligibility, submitMembershipForm } from '../../../repositories/publicForms';
import { toMembershipFormAnswers } from '../answers';
import { MembershipFormValues } from '../schema';

export function useSubmitMembershipForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async (phone: string, values: MembershipFormValues): Promise<MembershipEligibility | null> => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      return await submitMembershipForm(phone, toMembershipFormAnswers(values));
    } catch (e) {
      setSubmitError(errorMessage(e));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, submitError };
}
