// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Pagination, SearchInput, Skeleton, text, useModal } from 'bp-kit';
import { SlidersHorizontal } from 'lucide-react';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { StatusPill } from '../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { VisitorFiltersModal } from './components/VisitorFiltersModal';
import { useVisitors } from './hooks';
import { CompactFilterButton, PaginationWrap, SearchFiltersRow } from './styles';

export function VisitorsPage() {
  const navigate = useNavigate();
  const { open, close, modal } = useModal('drawer');
  const {
    people,
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

  const openFilters = () =>
    open(<VisitorFiltersModal close={close} statusFilter={statusFilter} onApply={setStatusFilter} />);

  return (
    <div>
      <PageHeader
        title="Visitantes"
        subtitle="Acompanhamento do primeiro contato até a integração"
        action={<Button onClick={() => navigate(AppRoute.NewVisitor)}>Novo visitante</Button>}
      />

      {!loading && !error && <PeopleCount count={totalCount} />}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && (
        <SearchFiltersRow>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome…" />
          <CompactFilterButton variant="secondary" onClick={openFilters}>
            <SlidersHorizontal size={16} />
            Filtros{statusFilter.length > 0 ? ` (${statusFilter.length})` : ''}
          </CompactFilterButton>
        </SearchFiltersRow>
      )}

      {!loading && !error && people.length === 0 && (
        <Empty
          title="Nenhum visitante encontrado"
          description={
            hasFilter
              ? 'Nenhum visitante encontrado para os filtros aplicados.'
              : 'Cadastre o primeiro visitante pelo botão acima.'
          }
        />
      )}

      {!loading && !error && people.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th>{text.fields.status}</Th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <Tr key={person.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
                  <Td $truncate title={person.name}>
                    {person.name}
                  </Td>
                  <Td $shrink>
                    <StatusPill person={person} compact />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {!loading && !error && people.length > 0 && totalPages > 1 && (
        <PaginationWrap>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </PaginationWrap>
      )}

      {modal}
    </div>
  );
}
