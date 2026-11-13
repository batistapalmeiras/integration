// Local
import { keyParser, optional } from '../lib/parse';

export type EntryType = 'baptism' | 'transfer_letter' | 'acclamation' | 'reconciliation';

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  baptism: 'Batismo',
  transfer_letter: 'Carta de Transferência',
  acclamation: 'Aclamação',
  reconciliation: 'Reconciliação',
};

export const ENTRY_TYPE_TONES: Record<EntryType, string> = {
  baptism: 'success',
  transfer_letter: 'warning',
  acclamation: 'neutral',
  reconciliation: 'neutral',
};

export const ENTRY_TYPE_DESCRIPTIONS: Record<EntryType, string> = {
  baptism: 'Para quem ainda não é batizado(a) e deseja se batizar na Igreja Batista Palmeiras.',
  transfer_letter: 'Para quem é membro de outra igreja Batista da Convenção Batista Brasileira.',
  acclamation: 'Para quem vem de uma igreja que não é Batista da Convenção Batista Brasileira.',
  reconciliation: 'Para quem foi desligado desta ou de outra igreja Batista e deseja voltar à comunhão.',
};

type WantsSmallGroup = 'yes' | 'not_now' | 'already';

export const WANTS_SMALL_GROUP_LABELS: Record<WantsSmallGroup, string> = {
  yes: 'Sim',
  not_now: 'Não',
  already: 'Já faço',
};

export const toEntryType = optional(keyParser(ENTRY_TYPE_LABELS, 'Tipo de entrada'));

export const MEMBERSHIP_ANSWER_LABELS = {
  entryType: 'Forma de entrada',
  originChurch: 'Igreja de origem',
  ministryInterests: 'Interesse em ministérios',
  wantsSmallGroup: 'Quer participar de um PG',
  secretSociety: 'Sociedade secreta',
  membershipNote: 'Observações',
};
