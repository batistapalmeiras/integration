// Local
import { useRole } from '../../access/useRole';
import { usePersonMakeups } from '../../../queries/person';
import { hasRole, LEADERSHIP_ROLES, TEACHING_ROLES } from '../../../types/enums';
import { detailTabs } from '../domain/details';
import { Person } from '../domain/types';

export function useDetailTabs(person: Person | null) {
  const role = useRole();
  const canSeeAnswers = hasRole(role, LEADERSHIP_ROLES);
  const canSeeMakeups = hasRole(role, TEACHING_ROLES);
  const makeups = usePersonMakeups(person?.id ?? '', !!person && canSeeMakeups).data ?? [];
  const tabs = person ? detailTabs(person, { canSeeAnswers, makeupCount: makeups.length }) : [];
  return { tabs, canSeeAnswers, makeups };
}
