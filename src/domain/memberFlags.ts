export const MEMBER_FLAGS = ['absent'] as const;

export type MemberFlag = (typeof MEMBER_FLAGS)[number];

export const MEMBER_FLAG_LABELS: Record<MemberFlag, string> = {
  absent: 'Membro ausente',
};

export const MEMBER_FLAG_FILTER_HINTS: Record<MemberFlag, string> = {
  absent: 'Quem está faltando com frequência e foi sinalizado no perfil.',
};

export const MEMBER_FLAG_DESCRIPTIONS: Record<MemberFlag, string> = {
  absent: 'Está faltando com frequência e precisa de acompanhamento.',
};

export const isMemberFlag = (value: string): value is MemberFlag => MEMBER_FLAGS.some((flag) => flag === value);
