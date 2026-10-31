// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Chip, Empty, PageHeader, Pagination, SearchInput, Skeleton, text, useMediaQuery } from 'bp-kit';
import { MessageCircle } from 'lucide-react';
// Local
import { Avatar } from '../../components/Avatar';
import { PeopleCount } from '../../components/PeopleCount';
import { VisitorQueue } from '../../features/visitors';
import { AppRoute } from '../../routes/paths';
import { VisitorPreview } from './components/VisitorPreview';
import { useVisitors, VisitorRow } from './hooks/useVisitors';
import { QueueFilter } from './persistence';
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
  WhatsAppButton,
} from './styles';

const QUEUE_TITLES: Record<VisitorQueue, string> = {
  contact: 'Precisam de você',
  waiting: 'Aguardando resposta',
  archived: 'Arquivados',
};

const QUEUE_CHIPS: { value: QueueFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'contact', label: 'Contatar' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'archived', label: 'Arquivados' },
];

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
    allCount,
    counts,
    loading,
    error,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    queue,
    setQueue,
    openWhatsApp,
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

  const chipCount = (value: QueueFilter) => (value === 'all' ? allCount : counts[value]);

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
          <QueueChips role="tablist" aria-label="Filtrar visitantes">
            {QUEUE_CHIPS.map((chip) => (
              <Chip
                key={chip.value}
                type="button"
                role="tab"
                aria-selected={queue === chip.value}
                $active={queue === chip.value}
                onClick={() => setQueue(chip.value)}
              >
                {chip.label} {chipCount(chip.value)}
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
                        <Avatar name={row.person.name} muted={row.queue !== 'contact'} />
                        <RowText>
                          <RowName>{row.person.name}</RowName>
                          <RowReason $tone={reasonTone(row)}>{row.reason}</RowReason>
                        </RowText>
                      </RowButton>
                      {row.queue === 'contact' && (
                        <WhatsAppButton
                          type="button"
                          aria-label={`Enviar WhatsApp para ${row.person.name}`}
                          onClick={() => openWhatsApp(row.person)}
                        >
                          <MessageCircle size={20} />
                        </WhatsAppButton>
                      )}
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
