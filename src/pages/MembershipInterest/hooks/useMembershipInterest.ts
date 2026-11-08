// React
import { useState } from 'react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { MembershipEligibility, submitMembershipInterest } from '../../../repositories/publicForms';
import { MembershipInterestFormValues } from '../validators/schema';

export function useMembershipInterest() {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async (phone: string, values: MembershipInterestFormValues): Promise<MembershipEligibility | null> => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      return await submitMembershipInterest(phone, {
        birthDate: values.birthDate,
        entryType: values.entryType,
        originChurch: values.originChurch || null,
        ministryInterests: values.noMinistryInterest ? [] : values.ministryInterests,
        secretSociety: values.secretSociety,
        wantsSmallGroup: values.wantsSmallGroup,
        membershipNote: values.membershipNote || null,
      });
    } catch (e) {
      setSubmitError(errorMessage(e));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, submitError };
}
