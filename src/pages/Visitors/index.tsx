// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Chip, Empty, PageHeader, Pagination, SearchInput, Skeleton, text, useMediaQuery } from 'bp-kit';
// Local
import { List, ListItem } from '../../components/List';
import { PeopleCount } from '../../components/PeopleCount';
import { StatusPill } from '../../components/StatusPill';
import { Person } from '../../features/visitors';
import { AppRoute } from '../../routes/paths';
import { PersonStatus, STATUS_META } from '../../types/person';
import { VisitorPreview } from './components/VisitorPreview';
import { useVisitors, VISIBLE_STATUSES } from './hooks/useVisitors';
import {
  ListColumn,
  PaginationWrap,
  PreviewColumn,
  QueueChips,
  RowButton,
  RowText,
  SearchRow,
  Split,
} from './styles';

export function VisitorsPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    reload,
    hasFilter,
  } = useVisitors();

  const previewId = isDesktop ? (selectedId ?? rows[0]?.id ?? null) : null;

  const openRow = (person: Person) => {
    if (isDesktop) setSelectedId(person.id);
    else navigate(`${AppRoute.Visitors}/${person.id}`);
  };

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
        <Split>
          <ListColumn>
            <List>
              {rows.map((person) => (
                <ListItem key={person.id} $selected={person.id === previewId}>
                  <RowButton type="button" onClick={() => openRow(person)}>
                    <RowText>
                      {person.name}
                    </RowText>
                    <StatusPill person={person} compact />
                  </RowButton>
                </ListItem>
              ))}
            </List>

            {totalPages > 1 && (
              <PaginationWrap>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </PaginationWrap>
            )}
          </ListColumn>

          {previewId && (
            <PreviewColumn aria-label="Pessoa selecionada">
              <VisitorPreview key={previewId} personId={previewId} onChanged={reload} />
            </PreviewColumn>
          )}
        </Split>
      )}
    </div>
  );
}
