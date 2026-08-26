// React
import { useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { MembershipInterestFormValues } from '../validators/schema';

export function useMembershipInterest() {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async (phone: string, values: MembershipInterestFormValues): Promise<boolean> => {
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.rpc('submit_membership_interest', {
      p_phone: phone,
      p_birth_date: values.birthDate,
      p_entry_type: values.entryType,
      p_origin_church: values.originChurch || null,
      p_ministry_interests: values.noMinistryInterest ? [] : values.ministryInterests,
      p_secret_society: values.secretSociety,
      p_wants_small_group: values.wantsSmallGroup,
      p_membership_note: values.membershipNote || null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return false;
    }

    return true;
  };

  return { submit, submitting, submitError };
}
