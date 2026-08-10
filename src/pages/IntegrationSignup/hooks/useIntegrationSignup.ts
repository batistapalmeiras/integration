// React
import { useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { SignupFormValues } from '../validators/schema';
import { CohortSchedule } from '../types';

export function useIntegrationSignup() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CohortSchedule | null>(null);

  const submit = async (phone: string, values: SignupFormValues) => {
    setSubmitting(true);
    setError(null);

    const { data, error: rpcError } = await supabase
      .rpc('submit_integration_signup', {
        p_phone: phone,
        p_attending_since: values.attendingSince,
        p_previous_church: values.previousChurch,
        p_baptism_info: values.baptismInfo,
        p_conversion_testimony: values.conversionTestimony,
        p_marital_status_story: values.maritalStatusStory,
      })
      .single();

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setResult(data as CohortSchedule);
  };

  return { submit, submitting, error, result };
}
