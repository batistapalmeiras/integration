// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { setPersonMinistries } from '../../../repositories/communityGroups';
import { confirmMember as confirmMemberUseCase, MemberConfirmation } from '../services/confirmMember';
import { PersonProfileSummary } from '../../../repositories/people';
import { usePersonProfileSummary } from '../../../queries/person';
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
  const profileQuery = usePersonProfileSummary(id);
  const profile = profileQuery.data ?? EMPTY_PROFILE;

  const confirmMember = async (confirmation: MemberConfirmation) => {
    if (!person) return;
    setPerson(await confirmMemberUseCase(person, confirmation, user?.id));
    await profileQuery.refetch();
  };

  const updateCommunity = async (smallGroupId: string | null, ministryIds: string[]) => {
    await updateFields({ small_group_id: smallGroupId, updated_at: new Date().toISOString() });
    await setPersonMinistries(id, ministryIds);
    await profileQuery.refetch();
  };

  return {
    ...personState,
    profile,
    confirmMember,
    updateCommunity,
  };
}
