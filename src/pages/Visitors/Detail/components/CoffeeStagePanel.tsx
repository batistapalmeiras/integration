// Libs
import { Button, InfoBox, Skeleton, Typography } from 'bp-kit';
// Local
import { RowActions } from '../../../../components/Table';
import { classInviteMessage } from '../../../../domain/whatsapp';
import { Person } from '../../types';
import { CardHeader, StagePanel } from '../styles';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';

interface CoffeeAttendance {
  id: string;
  attended: boolean;
}

interface Props {
  person: Person;
  attendance: CoffeeAttendance | null;
  loading: boolean;
  hasCohort: boolean | null;
  onMarkAttended: () => Promise<void>;
  onMarkNotAttended: () => Promise<void>;
  onDeclined: () => Promise<void>;
  onNoResponse: () => Promise<void>;
}

export function CoffeeStagePanel({
  person,
  attendance,
  loading,
  hasCohort,
  onMarkAttended,
  onMarkNotAttended,
  onDeclined,
  onNoResponse,
}: Props) {
  if (loading || !attendance) return <Skeleton $h="80px" />;

  if (!attendance.attended) {
    return (
      <StagePanel>
        <CardHeader>
          <Typography type="label">Presença no café</Typography>
        </CardHeader>
        <RowActions>
          <Button size="sm" variant="secondary" onClick={onMarkNotAttended}>
            Não compareceu
          </Button>
          <Button size="sm" variant="primary" onClick={onMarkAttended}>
            Compareceu
          </Button>
        </RowActions>
      </StagePanel>
    );
  }

  if (hasCohort === false) {
    return (
      <StagePanel>
        <InfoBox variant="warning">
          Não há turma de Integração ativa no momento. Peça para um professor abrir a turma antes de convidar.
        </InfoBox>
      </StagePanel>
    );
  }

  return (
    <StagePanel>
      <WhatsAppMessageBox person={person} defaultMessage={classInviteMessage(person.name)} buttonLabel="Convidar p/ turma" />
      <CardHeader>
        <Typography type="label">Resposta ao convite</Typography>
      </CardHeader>
      <RowActions>
        <Button size="sm" variant="secondary" onClick={onNoResponse}>
          Não respondeu
        </Button>
        <Button size="sm" variant="secondary" onClick={onDeclined}>
          Recusou
        </Button>
      </RowActions>
    </StagePanel>
  );
}
