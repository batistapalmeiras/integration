// Libs
import { InfoBox, Typography } from 'bp-kit';
// Local
import { MembershipEligibility, isEligibleForMembership } from '../types';

interface Props {
  name: string;
  eligibility: MembershipEligibility | null;
}

export function ConfirmationStep({ name, eligibility }: Props) {
  const firstName = name.split(' ')[0];

  if (!eligibility || isEligibleForMembership(eligibility)) {
    return (
      <InfoBox variant="info">
        Recebemos sua ficha, {firstName}! Ela será analisada pelo nosso conselho administrativo — em breve alguém
        entrará em contato.
      </InfoBox>
    );
  }

  const missing = eligibility.lessonsTotal - eligibility.lessonsAttended;

  return (
    <>
      <InfoBox variant="info">
        Recebemos sua ficha, {firstName}! Ela fica guardada com a gente e será analisada assim que você concluir a
        Integração.
      </InfoBox>
      <Typography type="p">
        <strong>O que ainda falta:</strong>
      </Typography>
      <Typography type="p">
        Concluir as aulas de Integração — você tem {eligibility.lessonsAttended} de {eligibility.lessonsTotal}{' '}
        {eligibility.lessonsTotal === 1 ? 'aula' : 'aulas'}, {missing === 1 ? 'falta 1' : `faltam ${missing}`}. Se você
        perdeu alguma, dá para repor assistindo ao vídeo que a Equipe de Integração envia.
      </Typography>
    </>
  );
}
