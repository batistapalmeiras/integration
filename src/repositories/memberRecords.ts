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
import { groupNames } from '../domain/communityGroups';
import { CouncilDate } from '../domain/councils';
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

function toMemberProfile(row: Record<string, string | number | boolean | null> | null): MemberProfile {
  const profileRow = row ?? {};
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

export async function getMemberProfile(personId: string): Promise<MemberProfile> {
  const { data, error } = await supabase.from('member_profiles').select('*').eq('person_id', personId).maybeSingle();
  if (error) throw error;
  return toMemberProfile(data);
}

interface MemberRecordInfo {
  createdAt: string;
  origin: string;
  statuteAgreedAt: string | null;
  council: CouncilDate | null;
}

export interface MemberCommunity {
  smallGroupIds: string[];
  smallGroupNames: string[];
  ministryIds: string[];
  ministryNames: string[];
}

export interface MemberPage {
  record: MemberRecord;
  info: MemberRecordInfo;
  community: MemberCommunity;
}

const MEMBER_PAGE_COLUMNS =
  'name, phone, email, membership_status, entry_type, council_id, created_at, origin, statute_agreed_at, council:councils(id, meeting_date), member_profiles(*), person_sensitive(birth_date, origin_church), person_small_groups!person_small_groups_person_id_fkey(small_group:small_groups!person_small_groups_small_group_id_fkey(id, name)), person_ministries(ministry:ministries!person_ministries_ministry_id_fkey(id, name))';

export async function getMemberPage(personId: string): Promise<MemberPage> {
  const { data: member, error } = await supabase.from('people').select(MEMBER_PAGE_COLUMNS).eq('id', personId).single();
  if (error) throw error;

  const smallGroups = groupNames(member.person_small_groups.flatMap((link) => (link.small_group ? [link.small_group] : [])));
  const ministries = groupNames(member.person_ministries.flatMap((link) => (link.ministry ? [link.ministry] : [])));

  return {
    record: {
      ...toMemberProfile(member.member_profiles),
      name: member.name,
      phone: member.phone ? maskPhone(member.phone) : '',
      email: member.email ?? '',
      membershipStatus: toMembershipStatus(member.membership_status ?? ''),
      birthDate: member.person_sensitive?.birth_date ?? '',
      entryType: toEntryType(member.entry_type) ?? '',
      originChurch: member.person_sensitive?.origin_church ?? '',
      councilId: member.council_id ?? '',
    },
    info: {
      createdAt: member.created_at,
      origin: member.origin,
      statuteAgreedAt: member.statute_agreed_at,
      council: member.council ? { id: member.council.id, meetingDate: member.council.meeting_date } : null,
    },
    community: {
      smallGroupIds: smallGroups.ids,
      smallGroupNames: smallGroups.names,
      ministryIds: ministries.ids,
      ministryNames: ministries.names,
    },
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
