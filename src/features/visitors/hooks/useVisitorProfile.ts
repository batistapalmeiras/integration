// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { savePersonCommunity } from '../../../repositories/communityGroups';
import { confirmMember as confirmMemberUseCase, MemberConfirmation } from '../services/confirmMember';
import { PersonProfileSummary } from '../../../repositories/people';
import { usePersonProfileSummary } from '../../../queries/person';
import { usePerson } from './usePerson';

const EMPTY_PROFILE: PersonProfileSummary = {
  coffeeDate: null,
  cohortName: null,
  smallGroupIds: [],
  smallGroupNames: [],
  ministryNames: [],
  ministryIds: [],
};

export function useVisitorProfile(id: string) {
  const { user } = useAuthCtx();
  const personState = usePerson(id);
  const { person, setPerson } = personState;
  const profileQuery = usePersonProfileSummary(id);
  const profile = profileQuery.data ?? EMPTY_PROFILE;

  const confirmMember = async (confirmation: MemberConfirmation) => {
    if (!person) return;
    setPerson(await confirmMemberUseCase(person, confirmation, user?.id));
    await profileQuery.refetch();
  };

  const updateCommunity = async (smallGroupIds: string[], ministryIds: string[]) => {
    setPerson(await savePersonCommunity(id, smallGroupIds, ministryIds));
    await profileQuery.refetch();
  };

  return {
    ...personState,
    profile,
    confirmMember,
    updateCommunity,
  };
}
