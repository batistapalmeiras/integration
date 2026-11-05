// Libs
import { Button, InfoBox, Typography } from 'bp-kit';
import { RotateCcw } from 'lucide-react';
// Local
import { Stack } from '../styles';

interface Props {
  onRestart: () => void;
}

export function DoneStep({ onRestart }: Props) {
  return (
    <Stack>
      <InfoBox variant="info">Olá! Recebemos sua ficha de interesse em se tornar membro da nossa igreja.</InfoBox>
      <Typography type="p">Agora, é necessário aguardar a próxima reunião do Conselho Administrativo.</Typography>
      <Typography type="p">Qualquer dúvida, estamos à disposição. Deus te abençoe!</Typography>
      <InfoBox variant="warning">Esta é uma ficha de teste. Nenhum dado foi enviado.</InfoBox>
      <Button type="button" variant="secondary" size="lg" fullWidth onClick={onRestart}>
        <RotateCcw size={16} />
        Preencher de novo
      </Button>
    </Stack>
  );
}
