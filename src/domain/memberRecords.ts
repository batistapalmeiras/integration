// Local
import { keyParser } from '../lib/parse';
import { EntryType } from '../types/church';
import { MEMBERSHIP_ALERT_LABELS, MembershipAlertCode } from './membership';
import { toOptions } from './text';

export type MembershipStatus = 'active' | 'pending_review' | 'inactive' | 'transferred' | 'removed' | 'deceased';

export const COUNTED_MEMBERSHIP_STATUSES: MembershipStatus[] = ['active', 'pending_review'];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'Ativo',
  pending_review: 'A confirmar',
  inactive: 'Inativo',
  transferred: 'Transferido',
  removed: 'Desligado',
  deceased: 'Falecido',
};

export const MEMBERSHIP_STATUS_TONES: Record<MembershipStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  pending_review: 'warning',
  inactive: 'neutral',
  transferred: 'neutral',
  removed: 'neutral',
  deceased: 'neutral',
};

export type Gender = 'male' | 'female';

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Masculino',
  female: 'Feminino',
};

export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced' | 'stable_union';

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
  stable_union: 'União estável',
};

export const MARITAL_STATUS_OPTIONS = toOptions(MARITAL_STATUS_LABELS);

export type PendencyField =
  | MembershipAlertCode
  | 'membership_status'
  | 'phone'
  | 'email'
  | 'birth_date'
  | 'gender'
  | 'marital_status'
  | 'address'
  | 'cpf';

export const PENDENCY_LABELS: Record<PendencyField, string> = {
  ...MEMBERSHIP_ALERT_LABELS,
  membership_status: 'Situação a confirmar',
  phone: 'Telefone',
  email: 'E-mail',
  birth_date: 'Nascimento',
  gender: 'Sexo',
  marital_status: 'Estado civil',
  address: 'Endereço',
  cpf: 'CPF',
};

export function isReviewPendency(field: PendencyField): boolean {
  return field === 'membership_status' || field in MEMBERSHIP_ALERT_LABELS;
}

export interface MemberRecord {
  name: string;
  phone: string;
  email: string;
  membershipStatus: MembershipStatus;
  birthDate: string;
  gender: Gender | '';
  maritalStatus: MaritalStatus | '';
  otherPhone: string;
  addressZip: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressReference: string;
  cpf: string;
  baptismDate: string;
  baptismChurch: string;
  entryType: EntryType | '';
  originChurch: string;
}

export const toMembershipStatus = keyParser(MEMBERSHIP_STATUS_LABELS, 'Situação de membresia');

export const toPendencyField = keyParser(PENDENCY_LABELS, 'Pendência');

export const canLeavePhoneEmpty = (origin: string | undefined) => origin === 'membership_signup';
