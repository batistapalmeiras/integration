// React
import { useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';

interface CheckResult {
  name: string;
  alreadySubmitted: boolean;
}

export function useCheckPhone() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (phone: string): Promise<CheckResult | null> => {
    setChecking(true);
    setError(null);

    const { data, error: rpcError } = await supabase
      .rpc('check_membership_interest_phone', { p_phone: phone })
      .single();

    setChecking(false);

    if (rpcError) {
      setError(rpcError.message);
      return null;
    }

    const row = data as { person_name: string; already_submitted: boolean };
    return { name: row.person_name, alreadySubmitted: row.already_submitted };
  };

  return { check, checking, error };
}
