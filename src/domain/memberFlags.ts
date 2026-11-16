export const MEMBER_FLAGS = ['absent'] as const;

export type MemberFlag = (typeof MEMBER_FLAGS)[number];

export const MEMBER_FLAG_LABELS: Record<MemberFlag, string> = {
  absent: 'Membro ausente',
};

export const MEMBER_FLAG_HINTS: Record<MemberFlag, string> = {
  absent: 'Quem está faltando com frequência e foi sinalizado no perfil.',
};

export const isMemberFlag = (value: string): value is MemberFlag => MEMBER_FLAGS.some((flag) => flag === value);
