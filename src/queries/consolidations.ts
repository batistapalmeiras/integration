// Local
import { ConsolidationKind, ConsolidationState, consolidationStateOf } from '../domain/consolidation';
import { invalidateQueries, useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { listConsolidationHistory, listConsolidationQueue } from '../repositories/consolidations';

export const useConsolidationQueue = (enabled = true) =>
  useQuery(queryKeys.consolidationQueue, listConsolidationQueue, { enabled });

export const useConsolidationHistory = (enabled = true) =>
  useQuery(queryKeys.consolidationHistory, listConsolidationHistory, { enabled });

export const useOverdueConsolidationCount = (enabled: boolean): number =>
  (useConsolidationQueue(enabled).data ?? []).filter((item) => item.overdue).length;

export function useGroupConsolidations(kind: ConsolidationKind, groupId: string): Record<string, ConsolidationState> {
  const states: Record<string, ConsolidationState> = {};
  (useConsolidationQueue().data ?? []).forEach((item) => {
    if (item.kind === kind && item.groupId === groupId) states[item.personId] = consolidationStateOf(item.overdue);
  });
  return states;
}

export const refreshConsolidations = () =>
  Promise.all([
    invalidateQueries(queryKeys.consolidationQueue),
    invalidateQueries(queryKeys.consolidationHistory),
    invalidateQueries(queryKeys.members),
  ]);
