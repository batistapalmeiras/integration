// React
import { useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { MakeupAttendanceContext } from '../types';

export function useMakeupAttendance(token: string) {
  const [context, setContext] = useState<MakeupAttendanceContext | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    supabase
      .rpc('get_makeup_attendance_context', { p_token: token })
      .single()
      .then(({ data, error }) => {
        if (error) {
          setLoadError(error.message);
        } else {
          setContext(data as MakeupAttendanceContext);
        }
        setLoading(false);
      });
  }, [token]);

  const submit = async (notes: string | undefined) => {
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.rpc('submit_makeup_attendance', { p_token: token, p_notes: notes ?? null });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setConfirmed(true);
  };

  return { context, loadError, loading, submit, submitting, submitError, confirmed };
}
