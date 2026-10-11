export type InterestStep = 'phone' | 'ineligible' | 'form' | 'confirmation';

export interface MembershipEligibility {
  lessonsAttended: number;
  lessonsTotal: number;
}

export function isEligibleForMembership({ lessonsAttended, lessonsTotal }: MembershipEligibility): boolean {
  return lessonsTotal > 0 && lessonsAttended >= lessonsTotal;
}
