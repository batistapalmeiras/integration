// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import {
  getMakeupAttendanceContext,
  MakeupAttendanceContext,
  submitMakeupAttendance,
} from '../../../repositories/publicForms';

export function useMakeupAttendance(token: string) {
  const [context, setContext] = useState<MakeupAttendanceContext | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getMakeupAttendanceContext(token)
      .then(setContext)
      .catch((e) => setLoadError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (notes: string | undefined) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitMakeupAttendance(token, notes ?? null);
      setConfirmed(true);
    } catch (e) {
      setSubmitError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return { context, loadError, loading, submit, submitting, submitError, confirmed };
}
