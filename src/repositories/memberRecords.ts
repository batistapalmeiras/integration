// Local
import { formatCPF, maskPhone, onlyDigits } from 'bp-kit';
import {
  COUNTED_MEMBERSHIP_STATUSES,
  Gender,
  MaritalStatus,
  MemberProfile,
  MemberRecord,
  MembershipStatus,
  PendencyField,
  toMembershipStatus,
  toPendencyField,
} from '../domain/memberRecords';
import { EntryType, toEntryType } from '../types/church';
import { nameFilter, phoneDigits } from '../domain/search';
import { supabase } from '../lib/supabase';

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

async function personIdsByPhone(search: string): Promise<string[]> {
  const digits = phoneDigits(search);
  if (!digits) return [];
  const { data, error } = await supabase
    .from('people')
    .select('id')
    .eq('status', 'member')
    .ilike('phone', `%${digits}%`);
  if (error) throw error;
  return (data ?? []).map((row) => row.id);
}

export async function listMemberPendencies(filters: {
  field: PendencyField | null;
  search: string;
  page: number;
  pageSize: number;
}): Promise<MemberPendencyPage> {
  let query = supabase.from('member_pendencies').select('*', { count: 'exact' }).order('name');
  if (filters.field) query = query.contains('missing_fields', [filters.field]);
  if (filters.search) {
    const ids = await personIdsByPhone(filters.search);
    const byName = nameFilter(filters.search);
    query = query.or(ids.length > 0 ? `${byName},person_id.in.(${ids.join(',')})` : byName);
  }
  const from = (filters.page - 1) * filters.pageSize;
  const { data, count, error } = await query.range(from, from + filters.pageSize - 1);
  if (error) throw error;
  const rows = (data ?? []).flatMap((row) =>
    row.person_id && row.name && row.membership_status
      ? [
          {
            person_id: row.person_id,
            name: row.name,
            membership_status: toMembershipStatus(row.membership_status),
            missing_fields: (row.missing_fields ?? []).map(toPendencyField),
          },
        ]
      : [],
  );
  return { rows, total: count ?? 0 };
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

const PROFILE_COLUMNS = {
  gender: 'gender',
  maritalStatus: 'marital_status',
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
  baptismDate: 'baptism_date',
  baptismChurch: 'baptism_church',
} as const satisfies Record<keyof MemberProfile, string>;

type ProfileKey = keyof typeof PROFILE_COLUMNS;

const blankToNull = (value: string) => (value.trim() === '' ? null : value.trim());

const digitsOrNull = (value: string) => blankToNull(onlyDigits(value));

export async function getMemberProfile(personId: string): Promise<MemberProfile> {
  const { data, error } = await supabase.from('member_profiles').select('*').eq('person_id', personId).maybeSingle();
  if (error) throw error;

  const profileRow = (data ?? {}) as Record<string, string | number | boolean | null>;
  const profileValues = Object.fromEntries(
    (Object.entries(PROFILE_COLUMNS) as [ProfileKey, string][]).map(([key, column]) => [
      key,
      String(profileRow[column] ?? ''),
    ]),
  ) as Record<ProfileKey, string>;

  return {
    ...profileValues,
    cpf: profileValues.cpf && formatCPF(profileValues.cpf),
    otherPhone: profileValues.otherPhone && maskPhone(profileValues.otherPhone),
    gender: profileValues.gender as Gender | '',
    maritalStatus: profileValues.maritalStatus as MaritalStatus | '',
  };
}

export async function getMemberRecord(personId: string): Promise<MemberRecord> {
  const [person, profile, sensitive] = await Promise.all([
    supabase.from('people').select('name, phone, email, membership_status, entry_type, council_id').eq('id', personId).single(),
    getMemberProfile(personId),
    supabase.from('person_sensitive').select('birth_date, origin_church').eq('person_id', personId).maybeSingle(),
  ]);
  const failure = person.error ?? sensitive.error;
  if (failure) throw failure;
  const member = person.data;
  if (!member) throw new Error('Membro não encontrado.');

  return {
    ...profile,
    name: member.name,
    phone: member.phone ? maskPhone(member.phone) : '',
    email: member.email ?? '',
    membershipStatus: toMembershipStatus(member.membership_status ?? ''),
    birthDate: sensitive.data?.birth_date ?? '',
    entryType: toEntryType(member.entry_type) ?? '',
    originChurch: sensitive.data?.origin_church ?? '',
    councilId: member.council_id ?? '',
  };
}

export interface MemberRecordInfo {
  createdAt: string;
  origin: string;
  statuteAgreedAt: string | null;
}

export async function getMemberRecordInfo(personId: string): Promise<MemberRecordInfo> {
  const { data, error } = await supabase
    .from('people')
    .select('created_at, origin, statute_agreed_at')
    .eq('id', personId)
    .single();
  if (error) throw error;
  return {
    createdAt: data.created_at,
    origin: data.origin,
    statuteAgreedAt: data.statute_agreed_at,
  };
}

export async function saveMemberRecord(personId: string, record: MemberRecord): Promise<void> {
  const profile: Record<string, string | number | boolean | null> = Object.fromEntries(
    (Object.entries(PROFILE_COLUMNS) as [ProfileKey, string][]).map(([key, column]) => [
      column,
      blankToNull(record[key]),
    ]),
  );
  profile.cpf = digitsOrNull(record.cpf);
  profile.other_phone = digitsOrNull(record.otherPhone);
  profile.address_zip = digitsOrNull(record.addressZip);

  const results = await Promise.all([
    supabase
      .from('people')
      .update({
        name: record.name.trim(),
        phone: digitsOrNull(record.phone),
        email: blankToNull(record.email),
        membership_status: record.membershipStatus,
        entry_type: record.entryType || null,
        council_id: record.councilId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', personId),
    supabase.from('member_profiles').upsert({ person_id: personId, ...profile }),
    supabase.from('person_sensitive').upsert({
      person_id: personId,
      birth_date: blankToNull(record.birthDate),
      origin_church: blankToNull(record.originChurch),
      updated_at: new Date().toISOString(),
    }),
  ]);
  const failure = results.find((result) => result.error)?.error;
  if (failure) throw failure;
}

export interface MemberRow {
  id: string;
  name: string;
  phone: string | null;
  entry_type: EntryType | null;
  membership_status: MembershipStatus;
}

export async function listMemberRows(): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from('people')
    .select('id, name, phone, entry_type, membership_status')
    .eq('status', 'member')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    entry_type: toEntryType(row.entry_type),
    membership_status: toMembershipStatus(row.membership_status ?? ''),
  }));
}
