// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { attachToNextWelcomeCoffee } from '../../../../domain/cafeSchedule';
import { supabase } from '../../../../lib/supabase';
import { CreateVisitorFormValues, ContactAttemptFormValues } from '../../validators';
import { Person } from '../../types';

export function useVisitorDetail(id: string) {
  const { user } = useAuthCtx();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('people').select('*').eq('id', id).single();
    if (loadError) setError(loadError.message);
    else setPerson(data as Person);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updatePerson = async (values: CreateVisitorFormValues) => {
    const { error: updateError } = await supabase
      .from('people')
      .update({
        name: values.name.trim(),
        phone: values.phone,
        age: values.age ? Number(values.age) : null,
        email: values.email || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (updateError) throw updateError;
    await load();
  };

  const changeStatus = async (toStatus: Person['status'], note?: string) => {
    if (!person) return;
    const { error: updateError } = await supabase
      .from('people')
      .update({ status: toStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updateError) throw updateError;

    await supabase.from('status_history').insert({
      person_id: id,
      from_status: person.status,
      to_status: toStatus,
      changed_by: user?.id,
      note: note || null,
    });

    await load();
  };

  const registerContactAttempt = async (values: ContactAttemptFormValues) => {
    // Contact is always made via WhatsApp by the volunteer — no channel choice in the UI.
    const { error: attemptError } = await supabase.from('contact_attempts').insert({
      person_id: id,
      channel: 'text',
      result: values.result,
      made_by: user?.id,
    });
    if (attemptError) throw attemptError;

    const toStatus =
      values.result === 'accepted' ? 'welcome_coffee' : values.result === 'declined' ? 'archived' : 'retry_contact';
    await changeStatus(toStatus);

    if (values.result === 'accepted') {
      await attachToNextWelcomeCoffee(id);
    }
  };

  const archive = () => changeStatus('archived');
  const reactivate = () => changeStatus('retry_contact');

  return { person, loading, error, updatePerson, registerContactAttempt, archive, reactivate };
}
