// Libs
import { onlyDigits, useAuthCtx } from 'bp-kit';
// Local
import { errorMessage, refreshMembershipPendingCount, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { reactivatePerson } from '../services/reactivatePerson';
import {
  deletePersonRow,
  fetchPerson,
  insertStatusHistory,
  updatePersonFields,
  updatePersonStatus,
} from '../infra/peopleRepository';
import { Person, PersonStatus, UpdatePersonInput } from '../domain/types';

const MEMBERSHIP_PENDING: PersonStatus = 'membership_pending';

export function usePerson(id: string) {
  const { user } = useAuthCtx();
  const query = useQuery(queryKeys.person(id), () => fetchPerson(id), { enabled: !!id });
  const person = query.data ?? null;

  const applyPerson = (updated: Person) => {
    const previousStatus = person?.status;
    setQueryData(queryKeys.person(id), updated);
    if (previousStatus !== updated.status && [previousStatus, updated.status].includes(MEMBERSHIP_PENDING)) {
      refreshMembershipPendingCount();
    }
  };

  const reload = async () => {
    await query.refetch();
  };

  const updateFields = async (fields: Record<string, unknown>) => {
    applyPerson(await updatePersonFields(id, fields));
  };

  const updatePerson = (values: UpdatePersonInput) =>
    updateFields({
      name: values.name.trim(),
      phone: onlyDigits(values.phone),
      age: values.age ? Number(values.age) : null,
      email: values.email || null,
      updated_at: new Date().toISOString(),
    });

  const changeStatus = async (toStatus: PersonStatus, note?: string, extra: Record<string, unknown> = {}) => {
    if (!person) return;
    const updated = await updatePersonStatus(id, toStatus, extra);
    await insertStatusHistory({ personId: id, fromStatus: person.status, toStatus, changedBy: user?.id, note });
    applyPerson(updated);
  };

  const archive = () => changeStatus('archived');

  const reactivate = async () => {
    if (!person) return;
    applyPerson(await reactivatePerson(person, user?.id));
  };

  const deletePerson = async () => {
    await deletePersonRow(id);
    if (person?.status === MEMBERSHIP_PENDING) refreshMembershipPendingCount();
  };

  return {
    person,
    setPerson: applyPerson,
    loading: query.loading,
    error: errorMessage(query.error),
    reload,
    updateFields,
    updatePerson,
    archive,
    reactivate,
    deletePerson,
  };
}
