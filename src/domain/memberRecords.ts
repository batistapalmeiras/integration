// Local
import { MEMBERSHIP_ALERT_LABELS, MembershipAlertCode } from './membership';
import { toOptions, YesNo } from './text';

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

export type Gender = 'male' | 'female';

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Masculino',
  female: 'Feminino',
};

export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
};

export type MaritalStatusOption = MaritalStatus | 'stable_union';

export const MARITAL_STATUS_OPTION_LABELS: Record<MaritalStatusOption, string> = {
  ...MARITAL_STATUS_LABELS,
  stable_union: 'União estável',
};

export const MARITAL_STATUS_OPTIONS = toOptions(MARITAL_STATUS_OPTION_LABELS);

export type PendencyField =
  | MembershipAlertCode
  | 'membership_status'
  | 'phone'
  | 'email'
  | 'birth_date'
  | 'gender'
  | 'marital_status'
  | 'nationality'
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
  nationality: 'Nacionalidade',
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
  nationality: string;
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
  publicNotes: string;
  birthplace: string;
  birthState: string;
  education: string;
  profession: string;
  workplace: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  weddingDate: string;
  childrenNames: string;
  childrenCount: string;
  baptismDate: string;
  baptismChurch: string;
  ministryBackground: string;
  preferredContact: string;
  readsEmail: YesNo | '';
  acceptsVisits: YesNo | '';
  legacyStatus: string;
}
