// React
import { useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';

export function useCheckPhone() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (phone: string): Promise<string | null> => {
    setChecking(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('check_welcome_coffee_phone', { p_phone: phone }).single();

    setChecking(false);

    if (rpcError) {
      setError(rpcError.message);
      return null;
    }

    return (data as { person_name: string }).person_name;
  };

  return { check, checking, error };
}
