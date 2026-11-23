// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { BottomSheet, Button, Chip, Empty, SearchInput, Skeleton, text, useModal } from 'bp-kit';
// Components
import { PageHeader } from '../../components/PageHeader';
import { SearchFiltersRow } from '../../components/ListLayout';
// Local
import { CountRow } from '../../components/CountRow';
import { PeopleCount } from '../../components/PeopleCount';
import { AppRoute } from '../../routes/paths';
import { PersonStatus, STATUS_META, VISITOR_QUEUE_STATUSES } from '../../types/person';
import { useVisitors } from './hooks/useVisitors';
import { VisitorList } from './components/VisitorList';
import { NewVisitorModal } from './New/NewVisitorModal';
import { ArchivedLink, QueueChips, SearchRow } from './styles';

export function VisitorsPage() {
  const navigate = useNavigate();
  const {
    rows,
    totalCount,
    loading,
    error,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    archivedCount,
    statusFilter,
    setStatusFilter,
    hasFilter,
  } = useVisitors();

  const toggleStatus = (status: PersonStatus) =>
    setStatusFilter(
      statusFilter.includes(status) ? statusFilter.filter((s) => s !== status) : [...statusFilter, status],
    );

  const [filtering, setFiltering] = useState(false);
  const { open, close, modal } = useModal('drawer', { fullScreenOnMobile: true });
  const newVisitor = (
    <Button variant="secondary" onClick={() => open(<NewVisitorModal close={close} />)}>
      <Plus size={16} />
      Visitante
    </Button>
  );

  return (
    <div>
      <PageHeader title="Visitantes" action={newVisitor} />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && (
        <>
          <SearchRow>
            <SearchFiltersRow>
              <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone…" />
              <Button variant="secondary" size="sm" onClick={() => setFiltering(true)}>
                <SlidersHorizontal size={16} />
                Filtros{statusFilter.length > 0 ? ` (${statusFilter.length})` : ''}
              </Button>
            </SearchFiltersRow>
          </SearchRow>
        </>
      )}

      {!loading && !error && (
        <CountRow>
          <PeopleCount count={totalCount} />
          <ArchivedLink type="button" onClick={() => navigate(AppRoute.ArchivedVisitors)}>
            Arquivados ({archivedCount})
            <ChevronRight size={16} aria-hidden="true" />
          </ArchivedLink>
        </CountRow>
      )}

      {!loading && !error && rows.length === 0 && (
        <Empty
          title="Ninguém na fila"
          description={
            hasFilter
              ? 'Nenhum visitante encontrado para os filtros aplicados.'
              : 'Os visitantes que precisam de contato aparecem aqui.'
          }
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <VisitorList rows={rows} page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {filtering && (
        <BottomSheet title="Filtrar por status" onClose={() => setFiltering(false)}>
          <QueueChips role="group" aria-label="Filtrar por status">
            {VISITOR_QUEUE_STATUSES.map((status) => (
              <Chip
                key={status}
                type="button"
                aria-pressed={statusFilter.includes(status)}
                $active={statusFilter.includes(status)}
                onClick={() => toggleStatus(status)}
              >
                {STATUS_META[status].label}
              </Chip>
            ))}
          </QueueChips>
        </BottomSheet>
      )}

      {modal}
    </div>
  );
}
