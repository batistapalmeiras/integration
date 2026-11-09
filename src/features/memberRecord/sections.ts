// Libs
import { text } from 'bp-kit';
// Local
import { formatDate } from '../../domain/dates';
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MemberRecord,
  MEMBERSHIP_STATUS_LABELS,
} from '../../domain/memberRecords';
import { YES_NO_LABELS } from '../../domain/text';

type FieldKind =
  | { kind: 'text'; placeholder?: string; maxLength?: number; numeric?: boolean; readOnly?: boolean }
  | { kind: 'phone' }
  | { kind: 'email' }
  | { kind: 'date' }
  | { kind: 'textarea'; rows: number }
  | { kind: 'select'; labels: Record<string, string>; emptyLabel?: string };

export type RecordField = { name: keyof MemberRecord; label: string } & FieldKind;

export interface RecordSection {
  id: string;
  title: string;
  fields: RecordField[];
}

const yesNo: FieldKind = { kind: 'select', labels: YES_NO_LABELS, emptyLabel: 'Não informado' };

export const MEMBER_RECORD_SECTIONS: RecordSection[] = [
  {
    id: 'membership',
    title: 'Membresia',
    fields: [{ name: 'membershipStatus', label: 'Situação', kind: 'select', labels: MEMBERSHIP_STATUS_LABELS }],
  },
  {
    id: 'contact',
    title: 'Contato',
    fields: [
      { name: 'phone', label: 'Celular', kind: 'phone' },
      { name: 'email', label: text.fields.email, kind: 'email' },
      { name: 'otherPhone', label: 'Outro telefone para contato', kind: 'phone' },
      { name: 'preferredContact', label: 'Forma de contato preferida', kind: 'text' },
      { name: 'readsEmail', label: 'Lê e-mails da igreja?', ...yesNo },
      { name: 'acceptsVisits', label: 'Aceita visitas?', ...yesNo },
    ],
  },
  {
    id: 'personal',
    title: 'Dados pessoais',
    fields: [
      { name: 'name', label: text.fields.name, kind: 'text', placeholder: text.fields.fullName },
      { name: 'cpf', label: 'CPF', kind: 'text', numeric: true, placeholder: '000.000.000-00' },
      { name: 'birthDate', label: 'Nascimento', kind: 'date' },
      { name: 'gender', label: 'Sexo', kind: 'select', labels: GENDER_LABELS, emptyLabel: 'Não informado' },
      {
        name: 'maritalStatus',
        label: 'Estado civil',
        kind: 'select',
        labels: MARITAL_STATUS_LABELS,
        emptyLabel: 'Não informado',
      },
      { name: 'nationality', label: 'Nacionalidade', kind: 'text' },
      { name: 'birthplace', label: 'Naturalidade', kind: 'text' },
      { name: 'birthState', label: 'Estado de nascimento', kind: 'text', placeholder: 'MG', maxLength: 2 },
      { name: 'education', label: 'Escolaridade', kind: 'text' },
      { name: 'profession', label: 'Profissão', kind: 'text' },
      { name: 'workplace', label: 'Local de trabalho', kind: 'text' },
    ],
  },
  {
    id: 'church',
    title: 'Vida na igreja',
    fields: [
      { name: 'baptismDate', label: 'Data de batismo', kind: 'date' },
      { name: 'baptismChurch', label: 'Igreja do batismo', kind: 'text' },
      { name: 'ministryBackground', label: 'Experiência em ministérios', kind: 'textarea', rows: 3 },
      { name: 'legacyStatus', label: 'Situação no sistema antigo', kind: 'text', readOnly: true },
    ],
  },
  {
    id: 'address',
    title: 'Endereço',
    fields: [
      { name: 'addressZip', label: 'CEP', kind: 'text', numeric: true },
      { name: 'addressStreet', label: 'Rua', kind: 'text' },
      { name: 'addressNumber', label: 'Número', kind: 'text' },
      { name: 'addressComplement', label: 'Complemento', kind: 'text' },
      { name: 'addressNeighborhood', label: 'Bairro', kind: 'text' },
      { name: 'addressCity', label: 'Cidade', kind: 'text' },
      { name: 'addressState', label: 'Estado', kind: 'text', placeholder: 'MG', maxLength: 2 },
      { name: 'addressReference', label: 'Ponto de referência', kind: 'text' },
    ],
  },
  {
    id: 'notes',
    title: 'Observações',
    fields: [{ name: 'publicNotes', label: 'Observações', kind: 'textarea', rows: 4 }],
  },
];

export function displayValue(record: MemberRecord, field: RecordField): string {
  const value = record[field.name];
  if (!value) return '';
  if (field.kind === 'date') return formatDate(value);
  if (field.kind === 'select') return field.labels[value] ?? '';
  return value;
}

export const WEDDING_DATE_FIELD: RecordField = { name: 'weddingDate', label: 'Data de casamento', kind: 'date' };

export const LEGACY_FAMILY_FIELDS = {
  spouse: { name: 'spouseName', label: 'Cônjuge' },
  father: { name: 'fatherName', label: 'Pai' },
  mother: { name: 'motherName', label: 'Mãe' },
  childrenNames: { name: 'childrenNames', label: 'Filhos' },
  childrenCount: { name: 'childrenCount', label: 'Quantidade de filhos' },
} as const satisfies Record<string, { name: keyof MemberRecord; label: string }>;
