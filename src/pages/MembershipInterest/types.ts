export type InterestStep = 'phone' | 'ineligible' | 'form' | 'confirmation';

export interface MembershipEligibility {
  lessonsAttended: number;
  lessonsTotal: number;
}
