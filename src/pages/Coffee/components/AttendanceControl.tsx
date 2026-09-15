// Libs
import { IconButton, Typography } from 'bp-kit';
import { Archive, Check, X } from 'lucide-react';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { DisplayStatusInput } from '../../../types/person';
import { AttendanceRow } from '../styles';

interface Props {
  attended: boolean;
  person: DisplayStatusInput;
  canManage: boolean;
  onMarkAttended: () => void;
  onMarkNotAttended: () => void;
  onCanceledByPerson: () => void;
}

// Compact icon toggle instead of full labeled buttons — reads the same on
// mobile, tablet and desktop instead of needing a wide column just for two
// buttons side by side.
export function AttendanceControl({ attended, person, canManage, onMarkAttended, onMarkNotAttended, onCanceledByPerson }: Props) {
  if (!canManage) {
    return (
      <Typography type="caption">
        {attended ? 'Compareceu — aguardando resposta ao convite' : 'Aguardando confirmação de presença'}
      </Typography>
    );
  }

  // Once attended, the person's own status (pending_signup) already says
  // where they are — canceling from here doesn't apply anymore; that lives
  // on the Visitor detail page (Recusou/Não respondeu) instead.
  if (attended) {
    return (
      <AttendanceRow>
        <StatusPill person={person} compact />
      </AttendanceRow>
    );
  }

  return (
    <AttendanceRow>
      <IconButton
        type="button"
        icon={<Archive size={16} />}
        iconPosition="center"
        variant="secondary"
        size="sm"
        onClick={onCanceledByPerson}
        title="Cancelou (avisou que não vem)"
      />
      <IconButton
        type="button"
        icon={<X size={16} />}
        iconPosition="center"
        variant="secondary"
        size="sm"
        onClick={onMarkNotAttended}
        title="Não compareceu"
      />
      <IconButton
        type="button"
        icon={<Check size={16} />}
        iconPosition="center"
        variant="secondary"
        size="sm"
        onClick={onMarkAttended}
        title="Compareceu"
      />
    </AttendanceRow>
  );
}
