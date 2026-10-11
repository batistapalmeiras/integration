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

export function AttendanceControl({ attended, person, canManage, onMarkAttended, onMarkNotAttended, onCanceledByPerson }: Props) {
  if (!canManage) {
    return (
      <Typography type="caption">
        {attended ? 'Compareceu — aguardando resposta ao convite' : 'Aguardando confirmação de presença'}
      </Typography>
    );
  }

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
