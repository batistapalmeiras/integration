// React
import { useState } from 'react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { checkMembershipInterestPhone, MembershipInterestCheck } from '../../../repositories/publicForms';

export function useCheckPhone() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (phone: string): Promise<MembershipInterestCheck | null> => {
    setChecking(true);
    setError(null);
    try {
      return await checkMembershipInterestPhone(phone);
    } catch (e) {
      setError(errorMessage(e));
      return null;
    } finally {
      setChecking(false);
    }
  };

  return { check, checking, error };
}
