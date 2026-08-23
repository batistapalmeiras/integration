// React
import { useState } from 'react';
// Libs
import { Card } from 'bp-kit';
// Local
import { coffeeInviteMessage } from '../../../../domain/whatsapp';
import { Person } from '../../types';
import { ContactAttemptFormValues } from '../../validators';
import { SectionDivider, SectionStack, StagePanel } from '../styles';
import { ContactTab } from './ContactTab';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';

interface Props {
  person: Person;
  onRegisterContact: (values: ContactAttemptFormValues) => Promise<void>;
}

export function ContactStagePanel({ person, onRegisterContact }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <StagePanel>
      <Card>
        <SectionStack>
          <WhatsAppMessageBox person={person} defaultMessage={coffeeInviteMessage(person.name)} onOpen={() => setOpened(true)} bare />
          {opened && (
            <SectionDivider>
              <ContactTab onSubmit={onRegisterContact} />
            </SectionDivider>
          )}
        </SectionStack>
      </Card>
    </StagePanel>
  );
}
