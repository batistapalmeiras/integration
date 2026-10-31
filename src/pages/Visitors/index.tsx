// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Chip, Empty, PageHeader, Pagination, SearchInput, Skeleton, text, useMediaQuery } from 'bp-kit';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { StatusPill } from '../../components/StatusPill';
import { VisitorQueue } from '../../features/visitors';
import { AppRoute } from '../../routes/paths';
import { PersonStatus, STATUS_META } from '../../types/person';
import { VisitorPreview } from './components/VisitorPreview';
import { useVisitors, VISIBLE_STATUSES, VisitorRow } from './hooks/useVisitors';
import {
  ListColumn,
  PaginationWrap,
  PreviewColumn,
  QueueChips,
  Row,
  RowButton,
  RowList,
  RowName,
  RowReason,
  RowText,
  SearchRow,
  Section,
  SectionCount,
  SectionHeader,
  SectionTitle,
  Split,
} from './styles';

const QUEUE_TITLES: Record<VisitorQueue, string> = {
  contact: 'Precisam de você',
  waiting: 'Aguardando resposta',
  archived: 'Arquivados',
};


function reasonTone(row: VisitorRow): 'info' | 'warning' | 'muted' {
  if (row.queue !== 'contact') return 'muted';
  return row.person.status === 'initial_contact' ? 'info' : 'warning';
}

export function VisitorsPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    rows,
    totalCount,
    counts,
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

  const sections = (['contact', 'waiting', 'archived'] as VisitorQueue[])
    .map((q) => ({ queue: q, rows: rows.filter((r) => r.queue === q) }))
    .filter((s) => s.rows.length > 0);

  const previewId = isDesktop ? (selectedId ?? rows[0]?.person.id ?? null) : null;

  const openRow = (row: VisitorRow) => {
    if (isDesktop) setSelectedId(row.person.id);
    else navigate(`${AppRoute.Visitors}/${row.person.id}`);
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
            {sections.map((section) => (
              <Section key={section.queue}>
                <SectionHeader>
                  <SectionTitle>{QUEUE_TITLES[section.queue]}</SectionTitle>
                  <SectionCount>
                    {counts[section.queue]} {counts[section.queue] === 1 ? 'pessoa' : 'pessoas'}
                  </SectionCount>
                </SectionHeader>
                <RowList>
                  {section.rows.map((row) => (
                    <Row key={row.person.id} $selected={row.person.id === previewId}>
                      <RowButton type="button" onClick={() => openRow(row)}>
                        <RowText>
                          <RowName>{row.person.name}</RowName>
                          <RowReason $tone={reasonTone(row)}>{row.reason}</RowReason>
                        </RowText>
                        <StatusPill person={row.person} compact />
                      </RowButton>
                    </Row>
                  ))}
                </RowList>
              </Section>
            ))}

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
