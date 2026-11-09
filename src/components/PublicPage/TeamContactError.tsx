// Libs
import { maskPhone } from 'bp-kit';
// Local
import { buildWhatsAppLink } from '../../domain/whatsapp';
import { REFERENCE_STALE_TIME, queryKeys } from '../../lib/queryKeys';
import { useQuery } from '../../lib/queryCache';
import { ContactStage, listTeamContacts } from '../../repositories/publicForms';
import { ContactLink, ContactList, ContactName, ErrorBlock, ErrorMsg } from './styles';

const CONTACT_LIST_LABELS: Record<ContactStage, string> = {
  welcome: 'Equipe de Integração',
  class: 'Equipe da Classe de Integração',
};

interface Props {
  message: string | null;
  stage?: ContactStage;
}

export function TeamContactError({ message, stage = 'welcome' }: Props) {
  const contacts = useQuery(queryKeys.publicTeamContacts(stage), () => listTeamContacts(stage), {
    staleTime: REFERENCE_STALE_TIME,
  });

  return (
    <ErrorBlock>
      <ErrorMsg>{message}</ErrorMsg>
      {!!contacts.data?.length && (
        <ContactList aria-label={CONTACT_LIST_LABELS[stage]}>
          {contacts.data.map((contact) => (
            <li key={contact.phone}>
              <ContactName>{contact.name}</ContactName>
              <ContactLink
                href={buildWhatsAppLink(contact.phone, `Olá, ${contact.name}!`)}
                target="_blank"
                rel="noreferrer"
              >
                {maskPhone(contact.phone)}
              </ContactLink>
            </li>
          ))}
        </ContactList>
      )}
    </ErrorBlock>
  );
}
