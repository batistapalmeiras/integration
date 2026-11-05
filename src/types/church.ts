export type EntryType = 'baptism' | 'transfer_letter' | 'acclamation' | 'reconciliation';

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  baptism: 'Batismo',
  transfer_letter: 'Carta de Transferência',
  acclamation: 'Aclamação',
  reconciliation: 'Reconciliação',
};

export const ENTRY_TYPE_DESCRIPTIONS: Partial<Record<EntryType, string>> = {
  transfer_letter: 'Para quem é membro de outra igreja Batista da Convenção Batista Brasileira.',
  acclamation:
    'Para quem vem de uma igreja que não é Batista da Convenção Batista Brasileira. A pessoa é recebida após dar seu testemunho público.',
  reconciliation:
    'Para quem foi desligado desta ou de outra igreja Batista e deseja voltar à comunhão. Inclui uma conversa com o Conselho Administrativo.',
};

export type WantsSmallGroup = 'yes' | 'not_now' | 'already';

export const WANTS_SMALL_GROUP_LABELS: Record<WantsSmallGroup, string> = {
  yes: 'Sim',
  not_now: 'Não',
  already: 'Já faço',
};
