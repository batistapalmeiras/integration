// Libs
import { InfoBox, Typography } from 'bp-kit';
// Local
import { MembershipEligibility, isEligibleForMembership } from '../types';

interface Props {
  eligibility: MembershipEligibility | null;
}

export function ConfirmationStep({ eligibility }: Props) {
  const pending = !!eligibility && !isEligibleForMembership(eligibility);
  const missingCount = eligibility ? eligibility.lessonsTotal - eligibility.lessonsAttended : 0;

  return (
    <>
      <InfoBox variant="info">
        Olá! Recebemos sua ficha de interesse em se tornar membro da nossa igreja.
      </InfoBox>

      <Typography type="p">Agora, é necessário aguardar a próxima reunião do Conselho Administrativo.</Typography>

      {pending && (
        <>
          <Typography type="p">
            <strong>O que falta:</strong>
          </Typography>
          <Typography type="p">Você precisa concluir todas as aulas da Classe de Integração.</Typography>
          <Typography type="p">
            Você participou de {eligibility!.lessonsAttended} das {eligibility!.lessonsTotal} aulas.{' '}
            {missingCount === 1 ? 'A aula que perdeu deverá ser reposta' : 'As aulas que perdeu deverão ser repostas'},
            e nossa equipe entrará em contato para orientar você.
          </Typography>
          <Typography type="p">A reposição é obrigatória para a conclusão do processo de membresia.</Typography>
        </>
      )}

      <Typography type="p">Deus te abençoe</Typography>
    </>
  );
}
