// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { confirmMember as confirmMemberUseCase, MemberConfirmation } from '../services/confirmMember';
import { usePerson } from './usePerson';

export function useVisitorProfile(id: string) {
  const { user } = useAuthCtx();
  const personState = usePerson(id);
  const { person, setPerson, reload } = personState;

  const confirmMember = async (confirmation: MemberConfirmation) => {
    if (!person) return;
    setPerson(await confirmMemberUseCase(person, confirmation, user?.id));
    await reload();
  };

  return {
    ...personState,
    confirmMember,
  };
}
