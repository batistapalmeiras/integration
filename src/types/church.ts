// Ministérios/PGs used to be fixed lists here — became admin-managed
// database tables 2026-08-25 (see src/domain/communityGroups.ts) so they
// can be created/renamed/deleted from Configurações.

export type EntryType = 'baptism' | 'transfer_letter' | 'acclamation' | 'reconciliation';

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  baptism: 'Batismo',
  transfer_letter: 'Carta de Transferência',
  acclamation: 'Aclamação',
  reconciliation: 'Reconciliação',
};

export type WantsSmallGroup = 'yes' | 'not_now' | 'already';

export const WANTS_SMALL_GROUP_LABELS: Record<WantsSmallGroup, string> = {
  yes: 'Sim',
  not_now: 'Nesse momento não',
  already: 'Já faço',
};
