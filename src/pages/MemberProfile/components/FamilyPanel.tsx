// React
import { Link } from 'react-router-dom';
// Libs
import { LinkButton } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Local
import { MemberRecord } from '../../../domain/memberRecords';
import { FAMILY_NAME_FIELDS } from '../../../features/memberRecord';
import { Family, Relative } from '../../../repositories/family';
import { AppRoute } from '../../../routes/paths';
import { Field, FieldLabel, Fields, FieldValue, RelativeLinks } from '../styles';
import { Panel, PanelHeader, PanelTitle } from '../../../components/Panel';

interface Props {
  record: MemberRecord;
  family: Family;
  onEdit: () => void;
}

const relativePath = (relative: Relative) => `${AppRoute.Members}/${relative.id}`;

interface RelativeFieldProps {
  label: string;
  relative: Relative | null;
  typedName: string;
  wide?: boolean;
}

function RelativeField({ label, relative, typedName, wide = false }: RelativeFieldProps) {
  const name = typedName.trim();
  return (
    <Field $wide={wide}>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue $empty={!relative && !name}>
        {relative ? <Link to={relativePath(relative)}>{relative.name}</Link> : name || '—'}
      </FieldValue>
    </Field>
  );
}

function ChildrenField({ record, family }: Pick<Props, 'record' | 'family'>) {
  const typedNames = record.childrenNames.trim();
  const count = family.children.length || Number(record.childrenCount) || 0;
  return (
    <Field $wide>
      <FieldLabel>
        {count > 0 ? `${FAMILY_NAME_FIELDS.childrenNames.label} (${count})` : FAMILY_NAME_FIELDS.childrenNames.label}
      </FieldLabel>
      {family.children.length > 0 ? (
        <FieldValue $empty={false}>
          <RelativeLinks>
            {family.children.map((child) => (
              <li key={child.id}>
                <Link to={relativePath(child)}>{child.name}</Link>
              </li>
            ))}
          </RelativeLinks>
        </FieldValue>
      ) : (
        <FieldValue $empty={!typedNames}>{typedNames || '—'}</FieldValue>
      )}
    </Field>
  );
}

export function FamilyPanel({ record, family, onEdit }: Props) {
  return (
    <Panel aria-label="Família">
      <PanelHeader>
        <PanelTitle>Família</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      <Fields>
        <RelativeField
          label={FAMILY_NAME_FIELDS.spouse.label}
          wide
          relative={family.spouse}
          typedName={record.spouseName}
        />
        <ChildrenField record={record} family={family} />
        <RelativeField label={FAMILY_NAME_FIELDS.father.label} relative={family.father} typedName={record.fatherName} />
        <RelativeField label={FAMILY_NAME_FIELDS.mother.label} relative={family.mother} typedName={record.motherName} />
      </Fields>
    </Panel>
  );
}
