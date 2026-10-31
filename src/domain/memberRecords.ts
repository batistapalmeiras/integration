// Libs
import { formatCPF, maskPhone } from 'bp-kit';
// Local
import { MEMBERSHIP_ALERT_LABELS, MembershipAlertCode } from './membershipAlerts';
import { supabase } from '../lib/supabase';

export type MembershipStatus = 'active' | 'pending_review' | 'inactive' | 'transferred' | 'removed' | 'deceased';

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
  widowed: 'Viúvo(a)',
  divorced: 'Divorciado(a)',
};

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
  | 'cpf'
  | 'rg';

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
  rg: 'RG',
};

export function isReviewPendency(field: PendencyField): boolean {
  return field === 'membership_status' || field in MEMBERSHIP_ALERT_LABELS;
}

export interface MemberPendency {
  person_id: string;
  name: string;
  membership_status: MembershipStatus;
  missing_fields: PendencyField[];
}

export interface MemberPendencyPage {
  rows: MemberPendency[];
  total: number;
}

export async function listMemberPendencies(filters: {
  field: PendencyField | null;
  search: string;
  page: number;
  pageSize: number;
}): Promise<MemberPendencyPage> {
  let query = supabase.from('member_pendencies').select('*', { count: 'exact' }).order('name');
  if (filters.field) query = query.contains('missing_fields', [filters.field]);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);
  const from = (filters.page - 1) * filters.pageSize;
  const { data, count, error } = await query.range(from, from + filters.pageSize - 1);
  if (error) throw error;
  return { rows: (data ?? []) as MemberPendency[], total: count ?? 0 };
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
  nickname: string;
  landline: string;
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
  rg: string;
}

const PROFILE_COLUMNS = {
  gender: 'gender',
  maritalStatus: 'marital_status',
  nationality: 'nationality',
  nickname: 'nickname',
  landline: 'landline',
  otherPhone: 'other_phone',
  addressZip: 'address_zip',
  addressStreet: 'address_street',
  addressNumber: 'address_number',
  addressComplement: 'address_complement',
  addressNeighborhood: 'address_neighborhood',
  addressCity: 'address_city',
  addressState: 'address_state',
  addressReference: 'address_reference',
  cpf: 'cpf',
  rg: 'rg',
} as const satisfies Partial<Record<keyof MemberRecord, string>>;

type ProfileKey = keyof typeof PROFILE_COLUMNS;

const blankToNull = (value: string) => (value.trim() === '' ? null : value.trim());
const digitsOrNull = (value: string) => blankToNull(value.replace(/\D/g, ''));

export async function getMemberRecord(personId: string): Promise<MemberRecord> {
  const [person, profile, sensitive] = await Promise.all([
    supabase.from('people').select('name, phone, email, membership_status').eq('id', personId).single(),
    supabase.from('member_profiles').select('*').eq('person_id', personId).maybeSingle(),
    supabase.from('person_sensitive').select('birth_date').eq('person_id', personId).maybeSingle(),
  ]);
  const failure = person.error ?? profile.error ?? sensitive.error;
  if (failure) throw failure;
  const member = person.data;
  if (!member) throw new Error('Membro não encontrado.');

  const profileRow = (profile.data ?? {}) as Record<string, string | null>;
  const profileValues = Object.fromEntries(
    (Object.entries(PROFILE_COLUMNS) as [ProfileKey, string][]).map(([key, column]) => [key, profileRow[column] ?? '']),
  ) as Record<ProfileKey, string>;

  return {
    ...profileValues,
    cpf: profileValues.cpf && formatCPF(profileValues.cpf),
    gender: profileValues.gender as Gender | '',
    maritalStatus: profileValues.maritalStatus as MaritalStatus | '',
    name: member.name,
    phone: member.phone ? maskPhone(member.phone) : '',
    email: member.email ?? '',
    membershipStatus: member.membership_status as MembershipStatus,
    birthDate: sensitive.data?.birth_date ?? '',
  };
}

export async function saveMemberRecord(personId: string, record: MemberRecord): Promise<void> {
  const profile = Object.fromEntries(
    (Object.entries(PROFILE_COLUMNS) as [ProfileKey, string][]).map(([key, column]) => [column, blankToNull(record[key])]),
  );
  profile.cpf = digitsOrNull(record.cpf);
  profile.address_zip = digitsOrNull(record.addressZip);

  const results = await Promise.all([
    supabase
      .from('people')
      .update({
        name: record.name.trim(),
        phone: digitsOrNull(record.phone),
        email: blankToNull(record.email),
        membership_status: record.membershipStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', personId),
    supabase
      .from('member_profiles')
      .upsert({ person_id: personId, ...profile, updated_at: new Date().toISOString() }),
    supabase
      .from('person_sensitive')
      .upsert({ person_id: personId, birth_date: blankToNull(record.birthDate), updated_at: new Date().toISOString() }),
  ]);
  const failure = results.find((result) => result.error)?.error;
  if (failure) throw failure;
}
