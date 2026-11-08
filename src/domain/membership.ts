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
