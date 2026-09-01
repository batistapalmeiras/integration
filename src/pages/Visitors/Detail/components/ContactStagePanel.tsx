// React
import { useState } from 'react';
// Libs
import { Button, Card, InfoBox } from 'bp-kit';
import { useNavigate } from 'react-router-dom';
// Local
import { initialContactMessage } from '../../../../domain/whatsapp';
import { AppRoute } from '../../../../routes/paths';
import { Person } from '../../types';
import { ContactAttemptFormValues } from '../../validators';
import { InfoBoxAction, SectionDivider, SectionStack, StagePanel } from '../styles';
import { ContactTab } from './ContactTab';
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

  const [skipWhatsApp, setSkipWhatsApp] = useState(false);

  const opened = !!person.whatsapp_opened_at || skipWhatsApp;
  const noCoffeeScheduled = hasCoffeeEvent === false;

  return (
    <StagePanel>
      <Card>
        <SectionStack>
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
          <WhatsAppMessageBox
            person={person}
            defaultMessage={initialContactMessage(person.name, volunteerName)}
            onOpen={onWhatsAppOpened}
            bare
            disabled={noCoffeeScheduled}
          />
          {!opened && !noCoffeeScheduled && (
            <Button type="button" variant="secondary" size="sm" onClick={() => setSkipWhatsApp(true)}>
              Já fiz contato de outra forma
            </Button>
          )}
          {opened && !noCoffeeScheduled && (
            <SectionDivider>
              <ContactTab onSubmit={onRegisterContact} />
            </SectionDivider>
          )}
        </SectionStack>
      </Card>
    </StagePanel>
  );
}
