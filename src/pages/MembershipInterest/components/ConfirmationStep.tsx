// Libs
import { InfoBox } from 'bp-kit';

interface Props {
  name: string;
}

export function ConfirmationStep({ name }: Props) {
  return (
    <InfoBox variant="info">
      Recebemos sua ficha, {name.split(' ')[0]}! Ela será analisada pelo nosso conselho administrativo — em breve
      alguém entrará em contato.
    </InfoBox>
  );
}
