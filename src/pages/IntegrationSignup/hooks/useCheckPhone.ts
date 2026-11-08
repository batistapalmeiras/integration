// React
import { useState } from 'react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { checkWelcomeCoffeePhone } from '../../../repositories/publicForms';

export function useCheckPhone() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (phone: string): Promise<string | null> => {
    setChecking(true);
    setError(null);
    try {
      return await checkWelcomeCoffeePhone(phone);
    } catch (e) {
      setError(errorMessage(e));
      return null;
    } finally {
      setChecking(false);
    }
  };

  return { check, checking, error };
}
