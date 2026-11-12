// Libs
import { InfoBox, Typography } from 'bp-kit';
import { CheckCircle2 } from 'lucide-react';
// Local
import { formatDate } from '../../../domain/dates';
import { CohortSchedule } from '../../../repositories/publicForms';
import { ConfirmationList, StepStack } from '../styles';

interface Props {
  result: CohortSchedule;
}

export function ConfirmationStep({ result }: Props) {
  return (
    <StepStack>
      <InfoBox variant="success" icon={CheckCircle2}>
        Inscrição confirmada na turma <strong>{result.cohort_name}</strong>!
      </InfoBox>
      <Typography type="p">Suas aulas serão:</Typography>
      <ConfirmationList>
        {result.lesson_dates.map((date, i) => (
          <li key={date}>
            {i + 1}ª aula — {formatDate(date)}
          </li>
        ))}
      </ConfirmationList>
      <InfoBox variant="info">
        Reforçamos que é necessário estar presente nas 4 aulas para se tornar membro. Esperamos você!
      </InfoBox>
    </StepStack>
  );
}
