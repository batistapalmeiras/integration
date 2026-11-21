export const MEMBER_FLAGS = ['absent', 'attention'] as const;

export type MemberFlag = (typeof MEMBER_FLAGS)[number];

export const MEMBER_FLAG_LABELS: Record<MemberFlag, string> = {
  absent: 'Membro ausente',
  attention: 'Membro em atenção',
};

export const MEMBER_FLAG_FILTER_HINTS: Record<MemberFlag, string> = {
  absent: 'Quem está faltando com frequência e foi sinalizado no perfil.',
  attention: 'Quem o pastor está acompanhando de perto.',
};

export const COUPLE_FLAG_FILTER_HINTS: Record<MemberFlag, string> = {
  absent: 'Casais em que pelo menos um dos dois foi sinalizado no perfil.',
  attention: 'Casais em que pelo menos um dos dois está sendo acompanhado de perto.',
};

export const MEMBER_FLAG_DESCRIPTIONS: Record<MemberFlag, string> = {
  absent: 'Está faltando com frequência e precisa de acompanhamento.',
  attention: 'Está passando por um momento delicado e precisa de acompanhamento próximo.',
};

export interface MemberFlagMark {
  flag: MemberFlag;
  flaggedAt: string;
}

export const isMemberFlag = (value: string): value is MemberFlag => MEMBER_FLAGS.some((flag) => flag === value);
