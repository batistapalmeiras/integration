// Libs
import { InfoBox, Typography } from 'bp-kit';
// Local
import { formatDate } from '../../../domain/dates';
import { CohortSchedule } from '../types';
import { ConfirmationList, StepStack } from '../styles';

interface Props {
  result: CohortSchedule;
}

export function ConfirmationStep({ result }: Props) {
  return (
    <StepStack>
      <Typography type="p">
        Inscrição confirmada na turma <strong>{result.cohort_name}</strong>! Suas aulas serão:
      </Typography>
      <ConfirmationList>
        {result.lesson_dates.map((date, i) => (
          <li key={date}>
            {i + 1}ª aula — {formatDate(date)}
          </li>
        ))}
      </ConfirmationList>
      <InfoBox variant="info">
        Reforçamos que é necessário estar presente em pelo menos 3 das 4 aulas para se tornar membro. Esperamos
        você!
      </InfoBox>
    </StepStack>
  );
}
