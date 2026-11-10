// React
import { useState } from 'react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { MembershipFormAnswers } from '../../../repositories/publicForms';
import { toMembershipFormAnswers } from '../answers';
import { MembershipFormValues } from '../schema';

export function useSubmitMembershipAnswers<Result>(send: (answers: MembershipFormAnswers) => Promise<Result>) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async (values: MembershipFormValues): Promise<{ result: Result } | null> => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      return { result: await send(toMembershipFormAnswers(values)) };
    } catch (e) {
      setSubmitError(errorMessage(e));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, submitError };
}
