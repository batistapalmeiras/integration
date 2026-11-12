// React
import { useNavigate } from 'react-router-dom';
// Libs
import { ChevronRight } from 'lucide-react';
import { Button, Chip, Empty, SearchInput, Skeleton, Tab, TabBar, text } from 'bp-kit';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { AppRoute } from '../../routes/paths';
import { PersonStatus, STATUS_META, VISITOR_QUEUE_STATUSES } from '../../types/person';
import { useVisitors } from './hooks/useVisitors';
import { VisitorList } from './components/VisitorList';
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

  return (
    <div>
      <PageHeader
        title="Visitantes"
        action={<Button onClick={() => navigate(AppRoute.NewVisitor)}>Novo visitante</Button>}
      />

      {!loading && !error && <PeopleCount count={totalCount} />}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && (
        <>
          <TabBar>
            <Tab $active>Na fila ({totalCount})</Tab>
            <ArchivedLink type="button" onClick={() => navigate(AppRoute.ArchivedVisitors)}>
              Arquivados ({archivedCount})
              <ChevronRight size={16} aria-hidden="true" />
            </ArchivedLink>
          </TabBar>
          <SearchRow>
            <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone…" />
          </SearchRow>
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
        </>
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
    </div>
  );
}
