// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, Pagination, SearchInput, Skeleton, text, useModal } from 'bp-kit';
import { SlidersHorizontal } from 'lucide-react';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { AppRoute } from '../../../routes/paths';
import { usePeopleReport } from '../hooks';
import { FiltersButtonRow, PlainTable, PlainTableWrap, SearchRow } from '../styles';
import { PeopleFiltersModal } from './PeopleFiltersModal';

export function PeopleSection() {
  const navigate = useNavigate();
  const { open, close, modal } = useModal();
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

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (cohortFilter !== 'all' ? 1 : 0);

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
          <PlainTableWrap>
            <PlainTable>
              <thead>
                <tr>
                  <th>{text.fields.name}</th>
                  <th>{text.fields.status}</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id} onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
                    <td>{person.name}</td>
                    <td>
                      <StatusPill status={person.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </PlainTable>
          </PlainTableWrap>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {modal}
    </div>
  );
}
