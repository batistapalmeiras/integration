export const MISSING_COMMUNITY_LABELS = {
  small_group: 'Sem PG',
  ministry: 'Sem ministério',
} as const;

export type MissingCommunity = keyof typeof MISSING_COMMUNITY_LABELS;

export interface CommunityMembership {
  inSmallGroup: boolean;
  inMinistry: boolean;
}

export const isMissingCommunity = (member: CommunityMembership, missing: MissingCommunity): boolean =>
  missing === 'small_group' ? !member.inSmallGroup : !member.inMinistry;
