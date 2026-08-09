// React
import { useState } from 'react';
// Libs
import { Button, RawTextarea } from 'bp-kit';
// Local
import { buildWhatsAppLink, defaultWhatsAppMessage } from '../../domain';
import { Person } from '../../types';
import { Actions } from '../styles';

interface Props {
  person: Person;
}

export function WhatsAppTab({ person }: Props) {
  const [message, setMessage] = useState(() => defaultWhatsAppMessage(person.name));

  const openWhatsApp = () => {
    window.open(buildWhatsAppLink(person.phone, message), '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <RawTextarea label="Mensagem" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
      <Actions>
        <Button type="button" variant="primary" onClick={openWhatsApp}>
          Abrir WhatsApp
        </Button>
      </Actions>
    </div>
  );
}
