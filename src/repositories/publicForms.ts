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

export interface MembershipInterestCheck extends MembershipEligibility {
  name: string;
  alreadySubmitted: boolean;
}

export interface MembershipInterestAnswers {
  birthDate: string;
  entryType: string;
  originChurch: string | null;
  ministryInterests: string[];
  secretSociety: string;
  wantsSmallGroup: string;
  membershipNote: string | null;
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

export async function listIntegrationTeamContacts(): Promise<TeamContact[]> {
  const { data, error } = await supabase.rpc('integration_team_contacts');
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
  const row = data as LessonsProgressRow & { person_name: string; already_submitted: boolean };
  return { name: row.person_name, alreadySubmitted: row.already_submitted, ...toEligibility(row) };
}

export async function submitMembershipInterest(
  phone: string,
  answers: MembershipInterestAnswers,
): Promise<MembershipEligibility> {
  const { data, error } = await supabase
    .rpc('submit_membership_interest', {
      p_phone: phone,
      p_birth_date: answers.birthDate,
      p_entry_type: answers.entryType,
      p_origin_church: answers.originChurch,
      p_ministry_interests: answers.ministryInterests,
      p_secret_society: answers.secretSociety,
      p_wants_small_group: answers.wantsSmallGroup,
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
