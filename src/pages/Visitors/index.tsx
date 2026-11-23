// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { BottomSheet, Button, Empty, SearchInput, Skeleton, text, useModal } from 'bp-kit';
// Components
import { PageHeader } from '../../components/PageHeader';
import { SearchFiltersRow } from '../../components/ListLayout';
// Local
import { CountLink, CountRow } from '../../components/CountRow';
import { PeopleCount } from '../../components/PeopleCount';
import { AppRoute } from '../../routes/paths';
import { STATUS_META, VISITOR_QUEUE_STATUSES } from '../../types/person';
import { useVisitors } from './hooks/useVisitors';
import { VisitorList } from './components/VisitorList';
import { NewVisitorModal } from './New/NewVisitorModal';
import { SearchRow } from './styles';

const ALL_STATUSES = 'all';

const STATUS_FILTER_OPTIONS = [
  { value: ALL_STATUSES, label: 'Todos' },
  ...VISITOR_QUEUE_STATUSES.map((status) => ({ value: status, label: STATUS_META[status].label })),
];

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

  const chooseStatus = (value: string) => {
    const status = VISITOR_QUEUE_STATUSES.find((item) => item === value);
    setStatusFilter(status ? [status] : []);
  };

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
          <CountLink type="button" onClick={() => navigate(AppRoute.ArchivedVisitors)}>
            Arquivados ({archivedCount})
            <ChevronRight size={16} aria-hidden="true" />
          </CountLink>
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
        <BottomSheet
          title="Filtrar por status"
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter[0] ?? ALL_STATUSES}
          onChange={chooseStatus}
          onClose={() => setFiltering(false)}
        />
      )}

      {modal}
    </div>
  );
}
