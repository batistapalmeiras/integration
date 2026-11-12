// Libs
import { Button, InfoBox, Skeleton, Typography } from 'bp-kit';
import { Check, Clock, X } from 'lucide-react';
// Local
import { FormActions } from '../../../../components/FormLayout';
import { PersonCoffeeAttendance, canMarkCoffeeAttendance } from '../../../../domain/cafeSchedule';
import { formatDate, todayKey } from '../../../../domain/dates';
import { classInviteMessage } from '../../../../domain/whatsapp';
import { Person } from '../../../../features/visitors';
import { Hint, StepBody } from '../styles';
import { StageCard } from './StageCard';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';

interface Props {
  person: Person;
  attendance: PersonCoffeeAttendance | null;
  loading: boolean;
  hasCohort: boolean | null;
  onMarkAttended: () => Promise<void>;
  onMarkNotAttended: () => Promise<void>;
  onDeclined: () => Promise<void>;
  onNoResponse: () => Promise<void>;
  onClassInviteSent: () => Promise<void>;
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
  onClassInviteSent,
}: Props) {
  if (loading) return <Skeleton $h="80px" />;

  if (!attendance) {
    return (
      <StageCard title="Café">
        <Hint>Ainda sem vaga em um café. Assim que houver um café agendado, a pessoa entra na lista automaticamente.</Hint>
      </StageCard>
    );
  }

  if (!attendance.attended && !canMarkCoffeeAttendance(attendance.eventDate, todayKey())) {
    return (
      <StageCard title="Aguardando o café">
        <Hint>
          Inscrita no café de {formatDate(attendance.eventDate)}. A presença só pode ser marcada a partir do dia do café.
        </Hint>
      </StageCard>
    );
  }

  if (!attendance.attended) {
    return (
      <StageCard title="Registrar presença">
        <FormActions>
          <Button variant="secondary" onClick={onMarkNotAttended}>
            <X size={16} />
            Não compareceu
          </Button>
          <Button variant="primary" onClick={onMarkAttended}>
            <Check size={16} />
            Compareceu
          </Button>
        </FormActions>
      </StageCard>
    );
  }

  if (hasCohort === false) {
    return (
      <StageCard title="Convidar para a turma">
        <InfoBox variant="warning">
          A próxima turma de Integração ainda não foi aberta. Peça ao pastor ou ao administrador para abrir antes de convidar.
        </InfoBox>
      </StageCard>
    );
  }

  return (
    <StageCard title="Convidar para a turma">
      <WhatsAppMessageBox
        person={person}
        defaultMessage={classInviteMessage(person.name)}
        buttonLabel="Convidar p/ turma"
        rows={12}
        bare
        onOpen={onClassInviteSent}
      />
      <StepBody>
        <Typography type="label">Resposta ao convite</Typography>
        <FormActions>
          <Button variant="secondary" onClick={onNoResponse}>
            <Clock size={16} />
            Não respondeu
          </Button>
          <Button variant="secondary" onClick={onDeclined}>
            <X size={16} />
            Recusou
          </Button>
        </FormActions>
      </StepBody>
    </StageCard>
  );
}
