// Libs
import { Card, InfoBox } from 'bp-kit';
// Local
import { coffeeInviteMessage } from '../../../../domain/whatsapp';
import { Person } from '../../types';
import { ContactAttemptFormValues } from '../../validators';
import { SectionDivider, SectionStack, StagePanel } from '../styles';
import { ContactTab } from './ContactTab';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';

interface Props {
  person: Person;
  hasCoffeeEvent: boolean | null;
  onRegisterContact: (values: ContactAttemptFormValues) => Promise<void>;
  onWhatsAppOpened: () => Promise<void>;
}

export function ContactStagePanel({ person, hasCoffeeEvent, onRegisterContact, onWhatsAppOpened }: Props) {
  const opened = !!person.whatsapp_opened_at;

  return (
    <StagePanel>
      <Card>
        <SectionStack>
          <WhatsAppMessageBox person={person} defaultMessage={coffeeInviteMessage(person.name)} onOpen={onWhatsAppOpened} bare />
          {opened &&
            (hasCoffeeEvent === false ? (
              <SectionDivider>
                <InfoBox variant="warning">
                  Não há café de boas-vindas agendado. Crie o café na aba Café antes de registrar o contato.
                </InfoBox>
              </SectionDivider>
            ) : (
              <SectionDivider>
                <ContactTab onSubmit={onRegisterContact} />
              </SectionDivider>
            ))}
        </SectionStack>
      </Card>
    </StagePanel>
  );
}
