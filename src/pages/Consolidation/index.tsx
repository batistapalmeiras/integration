// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { ChevronRight } from 'lucide-react';
import { Empty, Skeleton, text, useModal } from 'bp-kit';
// Components
import { CountLink, CountRow } from '../../components/CountRow';
import { PageHeader } from '../../components/PageHeader';
import { PeopleCount } from '../../components/PeopleCount';
import { TonePill } from '../../components/StatusPill';
// Local
import {
  CONSOLIDATION_STATE_LABELS,
  ConsolidationItem,
  ConsolidationKind,
  overdueFirst,
} from '../../domain/consolidation';
import { formatTimestampDate } from '../../domain/dates';
import { errorMessage } from '../../lib/queryCache';
import { useConsolidationQueue } from '../../queries/consolidations';
import { AppRoute } from '../../routes/paths';
import { AnswerModal } from './components/AnswerModal';
import { KindTabs } from './components/KindTabs';
import { ConsolidationRows } from './components/ConsolidationRows';
import { usePhotoOf } from './hooks/usePhotoOf';

export function ConsolidationPage() {
  const navigate = useNavigate();
  const { open, close, modal } = useModal('drawer');
  const [kind, setKind] = useState<ConsolidationKind>('small_group');
  const queue = useConsolidationQueue();
  const loadError = errorMessage(queue.error);
  const items = [...(queue.data ?? [])].filter((item) => item.kind === kind).sort(overdueFirst);
  const photoOf = usePhotoOf(items);

  const answer = (item: ConsolidationItem) => open(<AnswerModal item={item} close={close} />);

  return (
    <div>
      <PageHeader title="Consolidação" back />

      <KindTabs value={kind} onChange={setKind} />

      {queue.loading && <Skeleton $h="240px" />}

      {!queue.loading && loadError && <Empty title={text.feedback.loadError} description={loadError} />}

      {!queue.loading && !loadError && (
        <CountRow>
          <PeopleCount count={items.length} />
          <CountLink type="button" onClick={() => navigate(AppRoute.ConsolidationHistory)}>
            Histórico
            <ChevronRight size={16} aria-hidden="true" />
          </CountLink>
        </CountRow>
      )}

      {!queue.loading && !loadError && items.length === 0 && (
        <Empty title="Ninguém em consolidação" description="Quem entrar num PG ou ministério aparece aqui." />
      )}

      {!queue.loading && !loadError && items.length > 0 && (
        <ConsolidationRows
          kind={kind}
          rows={items}
          statusLabel="Prazo"
          renderStatus={(item) =>
            item.overdue ? (
              <TonePill $tone="warning">{CONSOLIDATION_STATE_LABELS.overdue}</TonePill>
            ) : (
              formatTimestampDate(item.dueAt)
            )
          }
          photoOf={photoOf}
          onOpen={answer}
        />
      )}

      {modal}
    </div>
  );
}
