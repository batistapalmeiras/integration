export const CONSOLIDATION_KIND_LABELS = {
  small_group: 'PG',
  ministry: 'Ministério',
} as const;

export type ConsolidationKind = keyof typeof CONSOLIDATION_KIND_LABELS;

export const CONSOLIDATION_KIND_SECTIONS: Record<ConsolidationKind, string> = {
  small_group: 'Pequenos Grupos',
  ministry: 'Ministérios',
};

const CONSOLIDATION_ANSWERS = {
  consolidated: 'Consolidou',
  not_consolidated: 'Não se consolidou',
} as const;

export type ConsolidationAnswer = keyof typeof CONSOLIDATION_ANSWERS;

export const CONSOLIDATION_OUTCOME_LABELS = {
  ...CONSOLIDATION_ANSWERS,
  redirected: 'Redirecionado',
} as const;

export type ConsolidationOutcome = keyof typeof CONSOLIDATION_OUTCOME_LABELS;

export const CONSOLIDATION_STATE_LABELS = {
  in_progress: 'Em consolidação',
  overdue: 'Prazo vencido',
} as const;

export type ConsolidationState = keyof typeof CONSOLIDATION_STATE_LABELS;

export const toConsolidationKind = (value: string | null): ConsolidationKind =>
  value === 'ministry' ? 'ministry' : 'small_group';

export const toConsolidationOutcome = (value: string | null): ConsolidationOutcome | null =>
  value === 'consolidated' || value === 'not_consolidated' || value === 'redirected' ? value : null;

export const consolidationStateOf = (overdue: boolean): ConsolidationState => (overdue ? 'overdue' : 'in_progress');

export interface ConsolidationItem {
  id: string;
  personId: string;
  personName: string;
  kind: ConsolidationKind;
  groupId: string;
  groupName: string;
  startedAt: string;
  dueAt: string;
  overdue: boolean;
}

export interface ConsolidationRecord {
  id: string;
  personId: string;
  personName: string;
  kind: ConsolidationKind;
  groupName: string;
  startedAt: string;
  closedAt: string;
  outcome: ConsolidationOutcome;
}

export const overdueFirst = (a: ConsolidationItem, b: ConsolidationItem): number =>
  Number(b.overdue) - Number(a.overdue) || a.dueAt.localeCompare(b.dueAt);
