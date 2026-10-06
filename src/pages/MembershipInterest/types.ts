export type InterestStep = 'phone' | 'ineligible' | 'form' | 'confirmation';

// What the person still has to do before the ficha can be analysed. The
// ficha itself can be filled at any point in the integração — only the
// membership decision waits for the classes to be over.
export interface MembershipEligibility {
  lessonsAttended: number;
  lessonsTotal: number;
}

export function isEligibleForMembership({ lessonsAttended, lessonsTotal }: MembershipEligibility): boolean {
  return lessonsTotal > 0 && lessonsAttended >= lessonsTotal;
}
