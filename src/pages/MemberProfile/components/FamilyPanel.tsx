// React
import { Link } from 'react-router-dom';
// Libs
import { LinkButton } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Local
import { MemberRecord } from '../../../domain/memberRecords';
import { displayValue, LEGACY_FAMILY_FIELDS, WEDDING_DATE_FIELD } from '../../../features/memberRecord';
import { Family, Relative } from '../../../repositories/family';
import { AppRoute } from '../../../routes/paths';
import {
  Field,
  FieldLabel,
  Fields,
  FieldValue,
  LegacyNote,
  Panel,
  PanelHeader,
  PanelTitle,
  RelativeLinks,
} from '../styles';

interface Props {
  record: MemberRecord;
  family: Family;
  onEdit: () => void;
}

function RelativeValue({ relative }: { relative: Relative | null }) {
  if (!relative) return <FieldValue $empty>—</FieldValue>;
  return (
    <FieldValue $empty={false}>
      <Link to={`${AppRoute.Members}/${relative.id}`}>{relative.name}</Link>
    </FieldValue>
  );
}

export function FamilyPanel({ record, family, onEdit }: Props) {
  const legacyFields = Object.values(LEGACY_FAMILY_FIELDS);
  const legacy = legacyFields
    .map((field) => ({ label: field.label, value: record[field.name].trim() }))
    .filter((field) => field.value !== '');
  const weddingDate = displayValue(record, WEDDING_DATE_FIELD);

  return (
    <Panel aria-label="Família">
      <PanelHeader>
        <PanelTitle>Família</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      <Fields>
        <Field $wide={false}>
          <FieldLabel>Cônjuge</FieldLabel>
          <RelativeValue relative={family.spouse} />
        </Field>
        <Field $wide={false}>
          <FieldLabel>{WEDDING_DATE_FIELD.label}</FieldLabel>
          <FieldValue $empty={!weddingDate}>{weddingDate || '—'}</FieldValue>
        </Field>
        <Field $wide={false}>
          <FieldLabel>Pai</FieldLabel>
          <RelativeValue relative={family.father} />
        </Field>
        <Field $wide={false}>
          <FieldLabel>Mãe</FieldLabel>
          <RelativeValue relative={family.mother} />
        </Field>
        <Field $wide>
          <FieldLabel>{family.children.length > 0 ? `Filhos (${family.children.length})` : 'Filhos'}</FieldLabel>
          {family.children.length > 0 ? (
            <FieldValue $empty={false}>
              <RelativeLinks>
                {family.children.map((child) => (
                  <li key={child.id}>
                    <Link to={`${AppRoute.Members}/${child.id}`}>{child.name}</Link>
                  </li>
                ))}
              </RelativeLinks>
            </FieldValue>
          ) : (
            <FieldValue $empty>—</FieldValue>
          )}
        </Field>
      </Fields>
      {legacy.length > 0 && (
        <LegacyNote>
          <FieldLabel as="span">Do sistema antigo</FieldLabel>
          <Fields>
            {legacy.map((field) => (
              <Field key={field.label} $wide={false}>
                <FieldLabel>{field.label}</FieldLabel>
                <FieldValue $empty={false}>{field.value}</FieldValue>
              </Field>
            ))}
          </Fields>
        </LegacyNote>
      )}
    </Panel>
  );
}
