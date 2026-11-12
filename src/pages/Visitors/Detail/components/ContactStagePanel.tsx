// React
import { useState } from 'react';
// Libs
import { Button, InfoBox, maskPhone } from 'bp-kit';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Local
import { initialContactMessage } from '../../../../domain/whatsapp';
import { AppRoute } from '../../../../routes/paths';
import { Person } from '../../../../features/visitors';
import { ContactAttemptFormValues } from '../../validators';
import { InfoBoxAction, StepBody } from '../styles';
import { ContactTab } from './ContactTab';
import { StageCard } from './StageCard';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';

interface Props {
  person: Person;
  volunteerName: string;
  hasCoffeeEvent: boolean | null;
  onRegisterContact: (values: ContactAttemptFormValues) => Promise<void>;
  onWhatsAppOpened: () => Promise<void>;
}

export function ContactStagePanel({ person, volunteerName, hasCoffeeEvent, onRegisterContact, onWhatsAppOpened }: Props) {
  const navigate = useNavigate();

  const [showResult, setShowResult] = useState(false);

  const openWhatsApp = async () => {
    await onWhatsAppOpened();
    setShowResult(true);
  };

  const noCoffeeScheduled = hasCoffeeEvent === false;
  const summary = {
    icon: MessageCircle,
    title: person.phone ? maskPhone(person.phone) : 'Sem WhatsApp',
    text: person.status === 'retry_contact' ? 'A última tentativa ficou sem resposta.' : 'Convite pelo WhatsApp.',
  };

  return (
    <StageCard title={person.status === 'retry_contact' ? 'Retomar contato' : 'Convidar para o café'} summary={summary}>
        {noCoffeeScheduled && (
          <InfoBox variant="warning">
            Ainda não há um café de boas-vindas agendado. Agende uma data na aba Café antes de entrar em contato.
            <InfoBoxAction>
              <Button type="button" variant="secondary" size="sm" onClick={() => navigate(AppRoute.Coffee)}>
                Ir para Café
              </Button>
            </InfoBoxAction>
          </InfoBox>
        )}
        {showResult && !noCoffeeScheduled ? (
          <ContactTab onSubmit={onRegisterContact} onBack={() => setShowResult(false)} />
        ) : (
          <StepBody>
            <WhatsAppMessageBox
              person={person}
              defaultMessage={initialContactMessage(person.name, volunteerName)}
              onOpen={openWhatsApp}
              bare
              disabled={noCoffeeScheduled}
            />
            {!noCoffeeScheduled && (
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowResult(true)}>
                {person.whatsapp_opened_at ? 'Registrar resultado do contato' : 'Já fiz contato de outra forma'}
              </Button>
            )}
          </StepBody>
        )}
    </StageCard>
  );
}
