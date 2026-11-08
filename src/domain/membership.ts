// Local
import { supabase } from '../lib/supabase';

export type MembershipAlertCode = 'secret_society' | 'baptism';

export const MEMBERSHIP_ALERT_LABELS: Record<MembershipAlertCode, string> = {
  secret_society: 'Sociedade secreta',
  baptism: 'Batismo não informado',
};

export interface MembershipAlert {
  person_id: string;
  code: MembershipAlertCode;
  answer: string | null;
  resolved: boolean;
}

export async function listMembershipAlerts(personIds: string[]): Promise<MembershipAlert[]> {
  if (personIds.length === 0) return [];
  const { data, error } = await supabase
    .from('membership_alerts')
    .select('person_id, code, answer, resolved')
    .in('person_id', personIds)
    .order('code', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MembershipAlert[];
}

export async function setMembershipAlertResolved(
  personId: string,
  code: MembershipAlertCode,
  resolved: boolean,
): Promise<void> {
  const { error } = resolved
    ? await supabase.from('membership_alert_resolutions').insert({ person_id: personId, code })
    : await supabase.from('membership_alert_resolutions').delete().eq('person_id', personId).eq('code', code);
  if (error) throw error;
}

interface CommunityAnswers {
  wants_small_group: string | null;
  ministry_interests: string[] | null;
}

export interface CommunityRequirements {
  smallGroupRequired: boolean;
  ministryRequired: boolean;
}

export function communityRequirements(answers: CommunityAnswers | null): CommunityRequirements {
  const ministries = answers?.ministry_interests;
  return {
    smallGroupRequired: answers?.wants_small_group !== 'not_now',
    ministryRequired: !(Array.isArray(ministries) && ministries.length === 0),
  };
}

export function hasCompletedLessons(lessonsAttended: number, lessonsTotal: number): boolean {
  return lessonsTotal > 0 && lessonsAttended >= lessonsTotal;
}
