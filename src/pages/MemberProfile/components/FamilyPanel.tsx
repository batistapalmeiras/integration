// React
import { Link } from 'react-router-dom';
// Libs
import { LinkButton } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Local
import { Family, Relative } from '../../../repositories/family';
import { AppRoute } from '../../../routes/paths';
import { RelativeLinks } from '../styles';
import { Field, FieldLabel, FieldValue, Fields, Panel, PanelHeader, PanelTitle } from '../../../components/Panel';

interface Props {
  family: Family;
  onEdit: () => void;
}

const relativePath = (relative: Relative) => `${AppRoute.Members}/${relative.id}`;

interface RelativeFieldProps {
  label: string;
  relative: Relative | null;
}

function RelativeField({ label, relative }: RelativeFieldProps) {
  return (
    <Field $wide>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue $empty={!relative}>
        {relative ? <Link to={relativePath(relative)}>{relative.name}</Link> : '—'}
      </FieldValue>
    </Field>
  );
}

function ChildrenField({ relatives }: { relatives: Relative[] }) {
  return (
    <Field $wide>
      <FieldLabel>{relatives.length > 0 ? `Filhos (${relatives.length})` : 'Filhos'}</FieldLabel>
      {relatives.length > 0 ? (
        <FieldValue $empty={false}>
          <RelativeLinks>
            {relatives.map((child) => (
              <li key={child.id}>
                <Link to={relativePath(child)}>{child.name}</Link>
              </li>
            ))}
          </RelativeLinks>
        </FieldValue>
      ) : (
        <FieldValue $empty>—</FieldValue>
      )}
    </Field>
  );
}

export function FamilyPanel({ family, onEdit }: Props) {
  return (
    <Panel aria-label="Família">
      <PanelHeader>
        <PanelTitle>Família</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      <Fields>
        <RelativeField label="Cônjuge" relative={family.spouse} />
        <ChildrenField relatives={family.children} />
      </Fields>
    </Panel>
  );
}
