// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, Pagination, SearchInput, Skeleton, text, useModal } from 'bp-kit';
import { SlidersHorizontal } from 'lucide-react';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { AppRoute } from '../../../routes/paths';
import { usePeopleReport } from '../hooks';
import { FiltersButtonRow, SearchRow } from '../styles';
import { PeopleFiltersModal } from './PeopleFiltersModal';

export function PeopleSection() {
  const navigate = useNavigate();
  const { open, close, modal } = useModal('drawer');
  const {
    people,
    cohortNames,
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

  if (loading) return <Skeleton $h="240px" />;
  if (error) return <Empty title={text.feedback.loadError} description={error} />;

  return (
    <div>
      <FiltersButtonRow>
        <Button variant="secondary" onClick={openFilters}>
          <SlidersHorizontal size={16} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </FiltersButtonRow>

      <SearchRow>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome…" />
      </SearchRow>

      {people.length === 0 ? (
        <Empty
          title="Nenhuma pessoa encontrada"
          description={hasFilter ? 'Nenhuma pessoa encontrada para os filtros aplicados.' : 'Nenhuma pessoa cadastrada ainda.'}
        />
      ) : (
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

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {modal}
    </div>
  );
}
