// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { setPersonMinistries } from '../../../repositories/communityGroups';
import { useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { confirmMember as confirmMemberUseCase } from '../services/confirmMember';
import { fetchPersonProfileSummary, PersonProfileSummary } from '../../../repositories/people';
import { usePerson } from './usePerson';

const EMPTY_PROFILE: PersonProfileSummary = {
  coffeeDate: null,
  cohortName: null,
  smallGroupName: null,
  ministryNames: [],
  ministryIds: [],
};

export function useVisitorProfile(id: string) {
  const { user } = useAuthCtx();
  const personState = usePerson(id);
  const { person, setPerson, updateFields } = personState;
  const profileQuery = useQuery(queryKeys.personProfile(id), () => fetchPersonProfileSummary(id), { enabled: !!id });
  const profile = profileQuery.data ?? EMPTY_PROFILE;

  const confirmMember = async (smallGroupId: string | null, ministryIds: string[]) => {
    if (!person) return;
    setPerson(await confirmMemberUseCase(person, smallGroupId, ministryIds, user?.id));
    await profileQuery.refetch();
  };

  const updateCommunity = async (smallGroupId: string | null, ministryIds: string[]) => {
    await updateFields({ small_group_id: smallGroupId, updated_at: new Date().toISOString() });
    await setPersonMinistries(id, ministryIds);
    await profileQuery.refetch();
  };

  return {
    ...personState,
    profileCoffeeDate: profile.coffeeDate,
    profileCohortName: profile.cohortName,
    profileMinistryNames: profile.ministryNames,
    profileSmallGroupName: profile.smallGroupName,
    profileMinistryIds: profile.ministryIds,
    confirmMember,
    updateCommunity,
  };
}
