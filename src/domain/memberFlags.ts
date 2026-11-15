export const MEMBER_FLAGS = ['absent'] as const;

export type MemberFlag = (typeof MEMBER_FLAGS)[number];

export const MEMBER_FLAG_LABELS: Record<MemberFlag, string> = {
  absent: 'Membro ausente',
};

export const isMemberFlag = (value: string): value is MemberFlag => MEMBER_FLAGS.some((flag) => flag === value);
