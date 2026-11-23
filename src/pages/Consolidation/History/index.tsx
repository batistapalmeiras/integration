// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, Skeleton, text } from 'bp-kit';
// Components
import { PageHeader } from '../../../components/PageHeader';
import { PeopleCount } from '../../../components/PeopleCount';
import { TonePill } from '../../../components/StatusPill';
// Local
import { CONSOLIDATION_OUTCOME_LABELS, ConsolidationKind, ConsolidationOutcome } from '../../../domain/consolidation';
import { errorMessage } from '../../../lib/queryCache';
import { useConsolidationHistory } from '../../../queries/consolidations';
import { memberPath } from '../../../routes/paths';
import { ConsolidationRows } from '../components/ConsolidationRows';
import { KindTabs } from '../components/KindTabs';
import { usePhotoOf } from '../hooks/usePhotoOf';

const OUTCOME_TONES: Record<ConsolidationOutcome, string> = {
  consolidated: 'success',
  not_consolidated: 'danger',
  redirected: 'info',
};

export function ConsolidationHistoryPage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<ConsolidationKind>('small_group');
  const history = useConsolidationHistory();
  const loadError = errorMessage(history.error);
  const records = (history.data ?? []).filter((record) => record.kind === kind);
  const photoOf = usePhotoOf(records);

  return (
    <div>
      <PageHeader title="Histórico de consolidação" back />

      <KindTabs value={kind} onChange={setKind} />

      {history.loading && <Skeleton $h="240px" />}

      {!history.loading && loadError && <Empty title={text.feedback.loadError} description={loadError} />}

      {!history.loading && !loadError && <PeopleCount count={records.length} />}

      {!history.loading && !loadError && records.length === 0 && (
        <Empty title="Nenhuma consolidação respondida" description="As respostas registradas aparecem aqui." />
      )}

      {!history.loading && !loadError && records.length > 0 && (
        <ConsolidationRows
          kind={kind}
          rows={records}
          statusLabel="Resposta"
          renderStatus={(record) => (
            <TonePill $tone={OUTCOME_TONES[record.outcome]}>{CONSOLIDATION_OUTCOME_LABELS[record.outcome]}</TonePill>
          )}
          photoOf={photoOf}
          onOpen={(record) => navigate(memberPath(record.personId))}
        />
      )}
    </div>
  );
}
