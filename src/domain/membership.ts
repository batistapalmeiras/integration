// Local
import { keyParser } from '../lib/parse';

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

interface CommunityAnswers {
  wants_small_group: string | null;
  ministry_interests: string[] | null;
}

export interface CommunityDeclines {
  smallGroup: boolean;
  ministry: boolean;
}

export function communityDeclines(answers: CommunityAnswers | null): CommunityDeclines {
  const ministries = answers?.ministry_interests;
  return {
    smallGroup: answers?.wants_small_group === 'not_now',
    ministry: Array.isArray(ministries) && ministries.length === 0,
  };
}

export function hasCompletedLessons(lessonsAttended: number, lessonsTotal: number): boolean {
  return lessonsTotal > 0 && lessonsAttended >= lessonsTotal;
}

export const toMembershipAlertCode = keyParser(MEMBERSHIP_ALERT_LABELS, 'Pendência de membresia');
