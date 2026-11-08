// Libs
import { formatCPF, maskPhone, onlyDigits } from 'bp-kit';
// Local
import { supabase } from '../lib/supabase';
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

type Gender = 'male' | 'female';

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Masculino',
  female: 'Feminino',
};

type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';

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

interface MemberPendency {
  person_id: string;
  name: string;
  membership_status: MembershipStatus;
  missing_fields: PendencyField[];
}

interface MemberPendencyPage {
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

export async function countMembers(): Promise<number> {
  const { count, error } = await supabase
    .from('people')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'member')
    .in('membership_status', COUNTED_MEMBERSHIP_STATUSES);
  if (error) throw error;
  return count ?? 0;
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

const PROFILE_COLUMNS = {
  gender: 'gender',
  maritalStatus: 'marital_status',
  nationality: 'nationality',
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
  publicNotes: 'public_notes',
  birthplace: 'birthplace',
  birthState: 'birth_state',
  education: 'education',
  profession: 'profession',
  workplace: 'workplace',
  fatherName: 'father_name',
  motherName: 'mother_name',
  spouseName: 'spouse_name',
  weddingDate: 'wedding_date',
  childrenNames: 'children_names',
  baptismDate: 'baptism_date',
  baptismChurch: 'baptism_church',
  ministryBackground: 'ministry_background',
  preferredContact: 'preferred_contact',
  legacyStatus: 'legacy_status',
} as const satisfies Partial<Record<keyof MemberRecord, string>>;

type ProfileKey = keyof typeof PROFILE_COLUMNS;

const toYesNo = (value: unknown): YesNo | '' => (value === true ? 'yes' : value === false ? 'no' : '');
const fromYesNo = (value: YesNo | '') => (value === '' ? null : value === 'yes');

const blankToNull = (value: string) => (value.trim() === '' ? null : value.trim());
const digitsOrNull = (value: string) => blankToNull(onlyDigits(value));

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

  const profileRow = (profile.data ?? {}) as Record<string, string | number | boolean | null>;
  const profileValues = Object.fromEntries(
    (Object.entries(PROFILE_COLUMNS) as [ProfileKey, string][]).map(([key, column]) => [key, String(profileRow[column] ?? '')]),
  ) as Record<ProfileKey, string>;

  return {
    ...profileValues,
    cpf: profileValues.cpf && formatCPF(profileValues.cpf),
    otherPhone: profileValues.otherPhone && maskPhone(profileValues.otherPhone),
    gender: profileValues.gender as Gender | '',
    maritalStatus: profileValues.maritalStatus as MaritalStatus | '',
    name: member.name,
    phone: member.phone ? maskPhone(member.phone) : '',
    email: member.email ?? '',
    membershipStatus: member.membership_status as MembershipStatus,
    birthDate: sensitive.data?.birth_date ?? '',
    childrenCount: profileRow.children_count == null ? '' : String(profileRow.children_count),
    readsEmail: toYesNo(profileRow.reads_email),
    acceptsVisits: toYesNo(profileRow.accepts_visits),
  };
}

export async function saveMemberRecord(personId: string, record: MemberRecord): Promise<void> {
  const profile: Record<string, string | number | boolean | null> = Object.fromEntries(
    (Object.entries(PROFILE_COLUMNS) as [ProfileKey, string][]).map(([key, column]) => [column, blankToNull(record[key])]),
  );
  profile.cpf = digitsOrNull(record.cpf);
  profile.other_phone = digitsOrNull(record.otherPhone);
  profile.address_zip = digitsOrNull(record.addressZip);
  profile.birth_state = blankToNull(record.birthState.toUpperCase());
  profile.children_count = record.childrenCount.trim() === '' ? null : Number(record.childrenCount);
  profile.reads_email = fromYesNo(record.readsEmail);
  profile.accepts_visits = fromYesNo(record.acceptsVisits);

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
