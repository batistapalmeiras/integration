// Libs
import { Empty, SearchInput, Skeleton, text } from 'bp-kit';
// Components
import { PageHeader } from '../../../components/PageHeader';
import { PeopleCount } from '../../../components/PeopleCount';
// Local
import { useArchivedVisitors } from '../hooks/useArchivedVisitors';
import { VisitorList } from '../components/VisitorList';
import { SearchRow } from '../styles';

export function ArchivedVisitorsPage() {
  const { rows, totalCount, loading, error, page, totalPages, setPage, search, setSearch, hasFilter } =
    useArchivedVisitors();

  return (
    <div>
      <PageHeader title="Visitantes arquivados" back />

      {!loading && !error && <PeopleCount count={totalCount} />}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && (
        <SearchRow>
          <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone…" />
        </SearchRow>
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
    </div>
  );
}
