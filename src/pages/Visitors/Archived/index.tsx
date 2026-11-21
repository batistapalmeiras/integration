// React
import { useState } from 'react';
// Libs
import { Button, Empty, OptionsSheet, SearchInput, Skeleton, text } from 'bp-kit';
import { ArrowUpDown } from 'lucide-react';
// Components
import { PageHeader } from '../../../components/PageHeader';
import { PeopleCount } from '../../../components/PeopleCount';
// Local
import { ARCHIVED_SORT_OPTIONS } from '../archivedSort';
import { useArchivedVisitors } from '../hooks/useArchivedVisitors';
import { VisitorList } from '../components/VisitorList';
import { SortRow } from '../styles';

export function ArchivedVisitorsPage() {
  const { rows, totalCount, loading, error, page, totalPages, setPage, search, setSearch, sort, setSort, hasFilter } =
    useArchivedVisitors();
  const [sorting, setSorting] = useState(false);

  return (
    <div>
      <PageHeader title="Visitantes arquivados" back />

      {!loading && !error && <PeopleCount count={totalCount} />}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && (
        <SortRow>
          <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone…" />
          <Button variant="secondary" size="sm" onClick={() => setSorting(true)}>
            <ArrowUpDown size={16} />
            Ordenar
          </Button>
        </SortRow>
      )}

      {!loading && !error && rows.length === 0 && (
        <Empty
          title="Nenhum visitante arquivado"
          description={hasFilter ? 'Nenhum visitante encontrado para a busca.' : ''}
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <VisitorList rows={rows} page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {sorting && (
        <OptionsSheet
          title="Ordenar por"
          options={ARCHIVED_SORT_OPTIONS}
          value={sort}
          onChange={setSort}
          onClose={() => setSorting(false)}
        />
      )}
    </div>
  );
}
