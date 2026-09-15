// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, Pagination, SearchInput, Skeleton, text, useModal } from 'bp-kit';
import { SlidersHorizontal } from 'lucide-react';
// Local
import { PeopleCount } from '../../../components/PeopleCount';
import { StatusPill } from '../../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { AppRoute } from '../../../routes/paths';
import { usePeopleReport } from '../hooks';
import { PageFlexBody, PaginationWrap, SearchFiltersRow } from '../styles';
import { PeopleFiltersModal } from './PeopleFiltersModal';

export function PeopleSection() {
  const navigate = useNavigate();
  const { open, close, modal } = useModal('drawer');
  const {
    people,
    cohortNames,
    totalCount,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    cohortFilter,
    setCohortFilter,
    search,
    setSearch,
    page,
    totalPages,
    setPage,
    hasFilter,
  } = usePeopleReport();

  const activeFilterCount = (statusFilter.length > 0 ? 1 : 0) + (cohortFilter !== 'all' ? 1 : 0);

  const openFilters = () =>
    open(
      <PeopleFiltersModal
        close={close}
        statusFilter={statusFilter}
        cohortFilter={cohortFilter}
        cohortNames={cohortNames}
        onApply={(status, cohort) => {
          setStatusFilter(status);
          setCohortFilter(cohort);
        }}
      />,
    );

  return (
    <PageFlexBody>
      <PeopleCount count={totalCount} />

      <SearchFiltersRow>
        <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome…" />
        <Button variant="secondary" size="sm" onClick={openFilters}>
          <SlidersHorizontal size={16} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </SearchFiltersRow>

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && people.length === 0 && (
        <Empty
          title="Nenhuma pessoa encontrada"
          description={hasFilter ? 'Nenhuma pessoa encontrada para os filtros aplicados.' : 'Nenhuma pessoa cadastrada ainda.'}
        />
      )}

      {!loading && !error && people.length > 0 && (
        <>
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

          <PaginationWrap>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </PaginationWrap>
        </>
      )}

      {modal}
    </PageFlexBody>
  );
}
