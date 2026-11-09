// Libs
import { maskPhone } from 'bp-kit';
// Local
import { buildWhatsAppLink } from '../../domain/whatsapp';
import { REFERENCE_STALE_TIME, queryKeys } from '../../lib/queryKeys';
import { useQuery } from '../../lib/queryCache';
import { listIntegrationTeamContacts } from '../../repositories/publicForms';
import { ContactLink, ContactList, ContactName, ErrorBlock, ErrorMsg } from './styles';

interface Props {
  message: string | null;
}

export function TeamContactError({ message }: Props) {
  const contacts = useQuery(queryKeys.publicIntegrationTeam, listIntegrationTeamContacts, {
    staleTime: REFERENCE_STALE_TIME,
  });

  return (
    <ErrorBlock>
      <ErrorMsg>{message}</ErrorMsg>
      {!!contacts.data?.length && (
        <ContactList aria-label="Equipe de Integração">
          {contacts.data.map((contact) => (
            <li key={contact.phone}>
              <ContactName>{contact.name}</ContactName>
              <ContactLink
                href={buildWhatsAppLink(contact.phone, `Olá, ${contact.name.split(' ')[0]}!`)}
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
