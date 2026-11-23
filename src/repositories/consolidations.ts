// Local
import {
  ConsolidationAnswer,
  ConsolidationItem,
  ConsolidationKind,
  ConsolidationRecord,
  ConsolidationState,
  consolidationStateOf,
  toConsolidationKind,
  toConsolidationOutcome,
} from '../domain/consolidation';
import { supabase } from '../lib/supabase';

const DETAIL_COLUMNS =
  'id, kind, started_at, closed_at, outcome, person:people!consolidations_person_id_fkey(id, name), small_group:small_groups!consolidations_small_group_id_fkey(id, name), ministry:ministries!consolidations_ministry_id_fkey(id, name)';

interface DueDate {
  dueAt: string;
  overdue: boolean;
}

export async function listConsolidationQueue(): Promise<ConsolidationItem[]> {
  const [due, details] = await Promise.all([
    supabase.from('consolidation_queue').select('id, due_at, overdue'),
    supabase.from('consolidations').select(DETAIL_COLUMNS).is('closed_at', null),
  ]);
  if (due.error) throw due.error;
  if (details.error) throw details.error;
  const dueById = new Map<string, DueDate>();
  due.data.forEach((row) => {
    if (row.id && row.due_at) dueById.set(row.id, { dueAt: row.due_at, overdue: !!row.overdue });
  });
  return details.data.flatMap((row) => {
    const group = row.small_group ?? row.ministry;
    const dueDate = dueById.get(row.id);
    if (!row.person || !group || !dueDate) return [];
    return [
      {
        id: row.id,
        personId: row.person.id,
        personName: row.person.name,
        kind: toConsolidationKind(row.kind),
        groupId: group.id,
        groupName: group.name,
        startedAt: row.started_at,
        ...dueDate,
      },
    ];
  });
}

export async function listConsolidationHistory(): Promise<ConsolidationRecord[]> {
  const { data, error } = await supabase
    .from('consolidations')
    .select(DETAIL_COLUMNS)
    .not('closed_at', 'is', null)
    .order('closed_at', { ascending: false });
  if (error) throw error;
  return data.flatMap((row) => {
    const group = row.small_group ?? row.ministry;
    const outcome = toConsolidationOutcome(row.outcome);
    if (!row.person || !group || !row.closed_at || !outcome) return [];
    return [
      {
        id: row.id,
        personId: row.person.id,
        personName: row.person.name,
        kind: toConsolidationKind(row.kind),
        groupName: group.name,
        startedAt: row.started_at,
        closedAt: row.closed_at,
        outcome,
      },
    ];
  });
}

export async function listConsolidationStates(): Promise<Record<string, ConsolidationState>> {
  const { data, error } = await supabase.from('consolidation_queue').select('person_id, overdue');
  if (error) throw error;
  const states: Record<string, ConsolidationState> = {};
  data.forEach((row) => {
    if (!row.person_id || states[row.person_id] === 'overdue') return;
    states[row.person_id] = consolidationStateOf(!!row.overdue);
  });
  return states;
}

export async function answerConsolidation(id: string, answer: ConsolidationAnswer): Promise<void> {
  const { error } = await supabase.rpc('close_consolidation', { p_consolidation_id: id, p_outcome: answer });
  if (error) throw error;
}

export async function redirectConsolidation(id: string, kind: ConsolidationKind, groupId: string): Promise<void> {
  const { error } = await supabase.rpc('redirect_consolidation', {
    p_consolidation_id: id,
    p_to_kind: kind,
    p_to_id: groupId,
  });
  if (error) throw error;
}
