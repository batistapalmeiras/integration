// Local
import { keyParser, optional } from '../lib/parse';
import { EntryType } from '../types/church';
import { toOptions } from './text';

export type MembershipStatus = 'active' | 'transferred' | 'removed' | 'deceased';

export const COUNTED_MEMBERSHIP_STATUSES: MembershipStatus[] = ['active'];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'Ativo',
  transferred: 'Transferido',
  removed: 'Desligado',
  deceased: 'Falecido',
};

export const MEMBERSHIP_STATUS_TONES: Record<MembershipStatus, 'success' | 'neutral'> = {
  active: 'success',
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

export const GENDER_OPTIONS = toOptions(GENDER_LABELS);

export const MARITAL_STATUS_OPTIONS = toOptions(MARITAL_STATUS_LABELS);

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
  councilId: string;
}

export type MemberProfile = Pick<
  MemberRecord,
  | 'gender'
  | 'maritalStatus'
  | 'otherPhone'
  | 'addressZip'
  | 'addressStreet'
  | 'addressNumber'
  | 'addressComplement'
  | 'addressNeighborhood'
  | 'addressCity'
  | 'addressState'
  | 'addressReference'
  | 'cpf'
  | 'baptismDate'
  | 'baptismChurch'
>;

export const toMembershipStatus = keyParser(MEMBERSHIP_STATUS_LABELS, 'Situação de membresia');

export const toGender = optional(keyParser(GENDER_LABELS, 'Sexo'));

export const toMaritalStatus = optional(keyParser(MARITAL_STATUS_LABELS, 'Estado civil'));

export const canLeavePhoneEmpty = (origin: string | undefined) => origin === 'membership_signup';
