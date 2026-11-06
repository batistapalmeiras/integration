// React
import { useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { SignupFormValues, toSignupAnswers } from '../validators/schema';
import { CohortSchedule } from '../types';

export function useIntegrationSignup(initialResult: CohortSchedule | null = null) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CohortSchedule | null>(initialResult);

  const submit = async (phone: string, values: SignupFormValues) => {
    setSubmitting(true);
    setError(null);

    const answers = toSignupAnswers(values);
    const { data, error: rpcError } = await supabase
      .rpc('submit_integration_signup', {
        p_phone: phone,
        p_attending_since: null,
        p_previous_church: answers.previousChurch,
        p_baptism_info: answers.baptismInfo,
        p_conversion_testimony: answers.conversionTestimony,
        p_marital_status_story: answers.maritalStatusStory,
      })
      .single();

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return null;
    }

    const schedule = data as CohortSchedule;
    setResult(schedule);
    return schedule;
  };

  return { submit, submitting, error, result };
}
