export interface CommunityAnswers {
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
