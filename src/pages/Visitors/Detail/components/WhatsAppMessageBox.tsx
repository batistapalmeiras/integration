// React
import { useState } from 'react';
// Libs
import { Button, Card, RawTextarea } from 'bp-kit';
// Local
import { buildWhatsAppLink } from '../../../../domain/whatsapp';
import { Person } from '../../types';
import { Actions } from '../styles';

interface Props {
  person: Person;
  defaultMessage: string;
  buttonLabel?: string;
  onOpen?: () => void;
  bare?: boolean;
  disabled?: boolean;
}

export function WhatsAppMessageBox({ person, defaultMessage, buttonLabel = 'Abrir WhatsApp', onOpen, bare, disabled }: Props) {
  const [message, setMessage] = useState(defaultMessage);

  const openWhatsApp = () => {
    window.open(buildWhatsAppLink(person.phone, message), '_blank', 'noopener,noreferrer');
    onOpen?.();
  };

  const content = (
    <>
      <RawTextarea label="Mensagem" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} disabled={disabled} />
      <Actions>
        <Button type="button" variant="primary" onClick={openWhatsApp} disabled={disabled}>
          {buttonLabel}
        </Button>
      </Actions>
    </>
  );

  return bare ? content : <Card>{content}</Card>;
}
