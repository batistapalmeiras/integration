// Libs
import { InfoBox, Typography } from 'bp-kit';
import { CheckCircle2 } from 'lucide-react';

export function SignupDone() {
  return (
    <>
      <InfoBox variant="success" icon={CheckCircle2}>
        Cadastro realizado com sucesso!
      </InfoBox>
      <Typography type="p">
        Recebemos sua ficha de interesse em se tornar membro da nossa igreja. Agora, é necessário aguardar a próxima
        reunião do Conselho Administrativo, que vai analisar o seu cadastro.
      </Typography>
      <Typography type="p">Deus te abençoe</Typography>
    </>
  );
}
