// Local
import { CONSOLIDATION_STATE_LABELS, ConsolidationState } from '../../domain/consolidation';
import { TonePill } from '../StatusPill';

export function ConsolidationPill({ state }: { state: ConsolidationState }) {
  return <TonePill $tone={state === 'overdue' ? 'warning' : 'info'}>{CONSOLIDATION_STATE_LABELS[state]}</TonePill>;
}
