// Libs
import { maskCEP, text } from 'bp-kit';
// Local
import { Council } from '../../domain/councils';
import { formatDate } from '../../domain/dates';
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MemberProfile,
  MemberRecord,
  MEMBERSHIP_STATUS_LABELS,
} from '../../domain/memberRecords';
import { ENTRY_TYPE_LABELS, MEMBERSHIP_ANSWER_LABELS } from '../../types/church';

type FieldKind =
  | { kind: 'text'; placeholder?: string; maxLength?: number; numeric?: boolean }
  | { kind: 'phone' }
  | { kind: 'email' }
  | { kind: 'date' }
  | { kind: 'textarea'; rows: number }
  | { kind: 'select'; labels: Record<string, string>; emptyLabel?: string }
  | { kind: 'council' };

export type RecordField = { name: keyof MemberRecord; label: string } & FieldKind;

export interface RecordSection {
  id: string;
  title: string;
  fields: RecordField[];
  summary?: (record: MemberProfile) => string[];
}

const joinFilled = (parts: string[], separator: string) =>
  parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(separator);

export function addressLines(record: MemberProfile): string[] {
  const street = joinFilled([record.addressStreet, record.addressNumber], ', ');
  const city = joinFilled([record.addressCity, record.addressState], '/');
  const zip = record.addressZip.trim() && `CEP ${maskCEP(record.addressZip)}`;
  const reference = record.addressReference.trim() && `Referência: ${record.addressReference.trim()}`;
  return [
    joinFilled([street, record.addressComplement], ' – '),
    joinFilled([record.addressNeighborhood, city], ' · '),
    zip,
    reference,
  ].filter(Boolean);
}

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
    ],
  },
  {
    id: 'church',
    title: 'Vida na igreja',
    fields: [
      { name: 'baptismDate', label: 'Data de batismo', kind: 'date' },
      { name: 'baptismChurch', label: 'Igreja do batismo', kind: 'text' },
      {
        name: 'entryType',
        label: MEMBERSHIP_ANSWER_LABELS.entryType,
        kind: 'select',
        labels: ENTRY_TYPE_LABELS,
        emptyLabel: 'Não informado',
      },
      { name: 'originChurch', label: MEMBERSHIP_ANSWER_LABELS.originChurch, kind: 'text' },
      { name: 'councilId', label: 'Aprovado no Conselho Administrativo de', kind: 'council' },
    ],
  },
  {
    id: 'address',
    title: 'Endereço',
    summary: addressLines,
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
];

export function displayValue(record: Partial<MemberRecord>, field: RecordField, councils: Council[] = []): string {
  const value = record[field.name];
  if (!value) return '';
  if (field.kind === 'council') {
    const council = councils.find((item) => item.id === value);
    return council ? formatDate(council.meetingDate) : '';
  }
  if (field.kind === 'date') return formatDate(value);
  if (field.kind === 'select') return field.labels[value] ?? '';
  return value;
}
