// Libs
import { Button, Typography } from 'bp-kit';
// Local
import { formatDate } from '../../../domain/dates';
import { useCohortSchedule } from '../hooks/useCohortSchedule';
import { ConfirmationList, StepStack } from '../styles';

interface Props {
  onContinue: () => void;
}

export function IntroStep({ onContinue }: Props) {
  const { schedule, loading } = useCohortSchedule();

  return (
    <StepStack>
      <Typography type="p">Seja bem-vindo(a) à Igreja Batista Palmeiras!</Typography>
      <Typography type="p">
        É um privilégio ter você conosco. A Classe de Integração é o passo fundamental para quem deseja conhecer
        nossa identidade e fazer parte da nossa família.
      </Typography>

      <Typography type="h5">Informações importantes</Typography>
      <Typography type="p">
        <strong>Pré-requisito:</strong> o participante deve ser frequentador regular dos nossos cultos.
      </Typography>
      <Typography type="p">
        <strong>Duração:</strong> o curso é composto por 4 encontros presenciais.
      </Typography>

      {!loading && schedule && schedule.lesson_dates?.length > 0 && (
        <>
          <Typography type="p">
            <strong>Cronograma das aulas — {schedule.cohort_name}</strong>
          </Typography>
          <ConfirmationList>
            {schedule.lesson_dates.map((date, i) => (
              <li key={date}>
                {i + 1}ª aula — {formatDate(date)}
              </li>
            ))}
          </ConfirmationList>
        </>
      )}

      <Typography type="p">Venha fazer parte da nossa família!</Typography>

      <Button type="button" variant="primary" size="lg" fullWidth onClick={onContinue}>
        Continuar
      </Button>
    </StepStack>
  );
}
