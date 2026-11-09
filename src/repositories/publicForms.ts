// Local
import { supabase } from '../lib/supabase';

export interface CohortSchedule {
  cohort_name: string;
  lesson_dates: string[];
}

export interface IntegrationSignupAnswers {
  previousChurch: string;
  baptismInfo: string;
  conversionTestimony: string;
  maritalStatusStory: string;
}

export interface MakeupAttendanceContext {
  person_name: string;
  lesson_number: number;
  cohort_name: string;
  already_confirmed: boolean;
}

export interface MembershipEligibility {
  lessonsAttended: number;
  lessonsTotal: number;
}

export interface SavedMembershipAnswers {
  email: string;
  birthDate: string;
  gender: string;
  cpf: string;
  maritalStatus: string;
  motherName: string;
  fatherName: string;
  otherPhone: string;
  zip: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  entryType: string;
  baptismChurch: string;
  baptismDate: string;
  originChurch: string;
  previousChurch: string;
  baptismInfo: string;
  maritalStatusStory: string;
  ministryInterests: string[];
  wantsSmallGroup: string;
  smallGroupId: string;
  secretSociety: string;
  membershipNote: string;
}

export interface MembershipInterestCheck extends MembershipEligibility {
  name: string;
  alreadySubmitted: boolean;
  saved: SavedMembershipAnswers;
}

export interface MembershipFormAnswers {
  name: string;
  gender: string;
  cpf: string;
  birthDate: string;
  maritalStatus: string;
  motherName: string;
  fatherName: string;
  email: string;
  otherPhone: string;
  zip: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  entryType: string;
  baptismChurch: string;
  baptismDate: string | null;
  lastChurch: string;
  ministryInterests: string[];
  wantsSmallGroup: string;
  smallGroupId: string | null;
  secretSociety: string;
  membershipNote: string;
}

export interface SmallGroupOption {
  id: string;
  name: string;
  leaders: string[];
}

interface LessonsProgressRow {
  lessons_attended: number;
  lessons_total: number;
}

const toEligibility = (row: LessonsProgressRow): MembershipEligibility => ({
  lessonsAttended: row.lessons_attended,
  lessonsTotal: row.lessons_total,
});

export interface TeamContact {
  name: string;
  phone: string;
}

export type ContactStage = 'welcome' | 'class';

export async function listTeamContacts(stage: ContactStage): Promise<TeamContact[]> {
  const { data, error } = await supabase.rpc('team_contacts', { p_stage: stage });
  if (error) throw error;
  return data ?? [];
}

export async function getActiveCohortSchedule(): Promise<CohortSchedule | null> {
  const { data, error } = await supabase.rpc('get_active_cohort_schedule');
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

export async function checkWelcomeCoffeePhone(phone: string): Promise<string> {
  const { data, error } = await supabase.rpc('check_welcome_coffee_phone', { p_phone: phone }).single();
  if (error) throw error;
  return (data as { person_name: string }).person_name;
}

export async function submitIntegrationSignup(
  phone: string,
  answers: IntegrationSignupAnswers,
): Promise<CohortSchedule> {
  const { data, error } = await supabase
    .rpc('submit_integration_signup', {
      p_phone: phone,
      p_attending_since: null,
      p_previous_church: answers.previousChurch,
      p_baptism_info: answers.baptismInfo,
      p_conversion_testimony: answers.conversionTestimony,
      p_marital_status_story: answers.maritalStatusStory,
    })
    .single();
  if (error) throw error;
  return data;
}

export async function getMakeupAttendanceContext(token: string): Promise<MakeupAttendanceContext> {
  const { data, error } = await supabase.rpc('get_makeup_attendance_context', { p_token: token }).single();
  if (error) throw error;
  return data;
}

export async function submitMakeupAttendance(token: string, notes: string | null): Promise<void> {
  const { error } = await supabase.rpc('submit_makeup_attendance', { p_token: token, p_notes: notes });
  if (error) throw error;
}

export async function checkMembershipInterestPhone(phone: string): Promise<MembershipInterestCheck> {
  const { data, error } = await supabase.rpc('check_membership_interest_phone', { p_phone: phone }).single();
  if (error) throw error;
  return {
    name: data.person_name,
    alreadySubmitted: data.already_submitted,
    ...toEligibility(data),
    saved: {
      email: data.email,
      birthDate: data.birth_date,
      gender: data.gender,
      cpf: data.cpf,
      maritalStatus: data.marital_status,
      motherName: data.mother_name,
      fatherName: data.father_name,
      otherPhone: data.other_phone,
      zip: data.address_zip,
      street: data.address_street,
      number: data.address_number,
      complement: data.address_complement,
      neighborhood: data.address_neighborhood,
      city: data.address_city,
      state: data.address_state,
      entryType: data.entry_type,
      baptismChurch: data.baptism_church,
      baptismDate: data.baptism_date,
      originChurch: data.origin_church,
      previousChurch: data.previous_church,
      baptismInfo: data.baptism_info,
      maritalStatusStory: data.marital_status_story,
      ministryInterests: data.ministry_interests,
      wantsSmallGroup: data.wants_small_group,
      smallGroupId: data.small_group_id,
      secretSociety: data.secret_society,
      membershipNote: data.membership_note,
    },
  };
}

export async function submitMembershipForm(
  phone: string,
  answers: MembershipFormAnswers,
): Promise<MembershipEligibility> {
  const { data, error } = await supabase
    .rpc('submit_membership_form', {
      p_phone: phone,
      p_name: answers.name,
      p_gender: answers.gender,
      p_cpf: answers.cpf,
      p_birth_date: answers.birthDate,
      p_marital_status: answers.maritalStatus,
      p_mother_name: answers.motherName,
      p_father_name: answers.fatherName,
      p_email: answers.email,
      p_other_phone: answers.otherPhone,
      p_address_zip: answers.zip,
      p_address_street: answers.street,
      p_address_number: answers.number,
      p_address_complement: answers.complement,
      p_address_neighborhood: answers.neighborhood,
      p_address_city: answers.city,
      p_address_state: answers.state,
      p_entry_type: answers.entryType,
      p_baptism_church: answers.baptismChurch,
      p_baptism_date: answers.baptismDate,
      p_last_church: answers.lastChurch,
      p_ministry_interests: answers.ministryInterests,
      p_wants_small_group: answers.wantsSmallGroup,
      p_small_group_id: answers.smallGroupId,
      p_secret_society: answers.secretSociety,
      p_membership_note: answers.membershipNote,
    })
    .single();
  if (error) throw error;
  return toEligibility(data);
}

export async function listPublicMinistryNames(): Promise<string[]> {
  const { data, error } = await supabase.rpc('list_ministries');
  if (error) throw error;
  return ((data ?? []) as { name: string }[]).map((ministry) => ministry.name);
}

export async function listPublicSmallGroups(): Promise<SmallGroupOption[]> {
  const { data, error } = await supabase.rpc('list_small_groups');
  if (error) throw error;
  return data ?? [];
}
