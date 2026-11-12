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
    { label: 'Celular', value: person.phone ? maskPhone(person.phone) : '', wide: false },
    { label: 'Idade', value: person.age ? `${person.age} anos` : '', wide: false },
    { label: 'E-mail', value: person.email ?? '', wide: true },
  ].filter((field) => field.value);

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
          <Field key={field.label} $wide={field.wide}>
            <FieldLabel>{field.label}</FieldLabel>
            <FieldValue $empty={false}>{field.value}</FieldValue>
          </Field>
        ))}
      </Fields>
    </Panel>
  );
}
