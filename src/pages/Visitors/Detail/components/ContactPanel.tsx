// Libs
import { LinkButton, maskPhone } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Local
import { Field, FieldLabel, Fields, FieldValue, Panel, PanelHeader, PanelTitle } from '../../../../components/Panel';
import { Person } from '../../../../features/visitors';

interface Props {
  person: Person;
  onEdit: () => void;
}

export function ContactPanel({ person, onEdit }: Props) {
  const fields = [
    { label: 'Celular', value: person.phone ? maskPhone(person.phone) : '' },
    { label: 'E-mail', value: person.email ?? '' },
    { label: 'Idade', value: person.age ? `${person.age} anos` : '' },
  ];
  return (
    <Panel aria-label="Contato">
      <PanelHeader>
        <PanelTitle>Contato</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      <Fields>
        {fields.map((field) => (
          <Field key={field.label} $wide>
            <FieldLabel>{field.label}</FieldLabel>
            <FieldValue $empty={!field.value}>{field.value || '—'}</FieldValue>
          </Field>
        ))}
      </Fields>
    </Panel>
  );
}
