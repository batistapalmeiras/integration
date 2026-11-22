// Libs
import { KeyRound } from 'lucide-react';
// Components
import { TonePill } from '../../../components/StatusPill';
// Local
import { usePersonAccessRole } from '../../../queries/person';
import { ROLE_LABELS } from '../../../types/enums';

export function AccessRolePill({ personId }: { personId: string }) {
  const role = usePersonAccessRole(personId).data;
  if (!role) return null;

  return (
    <TonePill $tone="neutral" title="Cargo no sistema">
      <KeyRound size={12} aria-hidden="true" />
      {ROLE_LABELS[role]}
    </TonePill>
  );
}
