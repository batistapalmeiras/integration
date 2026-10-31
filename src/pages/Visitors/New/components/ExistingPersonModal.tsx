// Libs
import { Button, maskPhone, ModalActions, ModalTitle, Typography } from 'bp-kit';
import { RotateCcw } from 'lucide-react';
// Local
import { Avatar } from '../../../../components/Avatar';
import { StatusPill } from '../../../../components/StatusPill';
import { formatTimestampDate } from '../../../../domain/dates';
import { Person } from '../../../../features/visitors';
import { ExistingCard, ExistingHead, ExistingName, ExistingRow } from '../styles';

interface Props {
  person: Person;
  close: () => void;
  onReactivate: () => Promise<void>;
  onOpen: () => void;
}

export function ExistingPersonModal({ person, close, onReactivate, onOpen }: Props) {
  const archived = person.status === 'archived';

  return (
    <>
      <ModalTitle onClose={close}>Este telefone já está cadastrado</ModalTitle>
      <Typography type="p">
        {archived
          ? 'Em vez de criar outro cadastro, você pode reativar o que já existe.'
          : 'Essa pessoa já está no processo. Abra o cadastro dela em vez de criar outro.'}
      </Typography>
      <ExistingCard>
        <ExistingHead>
          <Avatar name={person.name} size={44} />
          <ExistingName>
            <Typography type="h5" as="span">
              {person.name}
            </Typography>
            <Typography type="caption" as="span">
              {maskPhone(person.phone)}
            </Typography>
          </ExistingName>
          <StatusPill person={person} compact />
        </ExistingHead>
        <ExistingRow>
          <Typography type="caption" as="span">
            Cadastrado em
          </Typography>
          <Typography type="span">{formatTimestampDate(person.created_at)}</Typography>
        </ExistingRow>
        <ExistingRow>
          <Typography type="caption" as="span">
            E-mail
          </Typography>
          <Typography type="span">{person.email ?? '—'}</Typography>
        </ExistingRow>
      </ExistingCard>
      <ModalActions>
        {archived ? (
          <Button type="button" onClick={onReactivate}>
            <RotateCcw size={16} />
            Reativar
          </Button>
        ) : (
          <Button type="button" onClick={onOpen}>
            Abrir cadastro
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={close}>
          Cancelar
        </Button>
      </ModalActions>
    </>
  );
}
