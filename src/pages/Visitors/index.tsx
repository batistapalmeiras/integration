// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Chip, Empty, PageHeader, Pagination, SearchInput, Skeleton, text } from 'bp-kit';
// Local
import { List, ListChevron, ListGrow, ListHeader, ListItem, ListSlot, ListStatusCell } from '../../components/List';
import { PeopleCount } from '../../components/PeopleCount';
import { StatusPill } from '../../components/StatusPill';
import { AppRoute } from '../../routes/paths';
import { PersonStatus, STATUS_META } from '../../types/person';
import { useVisitors, VISIBLE_STATUSES } from './hooks/useVisitors';
import { PaginationWrap, QueueChips, RowButton, RowText, SearchRow } from './styles';

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
          <SearchRow>
            <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome…" />
          </SearchRow>
          <QueueChips role="group" aria-label="Filtrar por status">
            {VISIBLE_STATUSES.map((status) => (
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
          title="Nenhum visitante encontrado"
          description={
            hasFilter
              ? 'Nenhum visitante encontrado para os filtros aplicados.'
              : 'Cadastre o primeiro visitante pelo botão acima.'
          }
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <List>
            <ListHeader aria-hidden="true">
              <ListGrow>{text.fields.name}</ListGrow>
              <ListStatusCell>{text.fields.status}</ListStatusCell>
              <ListSlot $width={16} />
            </ListHeader>
            {rows.map((person) => (
              <ListItem key={person.id}>
                <RowButton type="button" onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
                  <RowText>{person.name}</RowText>
                  <ListStatusCell>
                    <StatusPill person={person} compact />
                  </ListStatusCell>
                  <ListChevron />
                </RowButton>
              </ListItem>
            ))}
          </List>

          {totalPages > 1 && (
            <PaginationWrap>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </PaginationWrap>
          )}
        </>
      )}
    </div>
  );
}
