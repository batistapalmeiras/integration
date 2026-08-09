// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, Pagination, RawSelect, SearchInput, Skeleton, text } from 'bp-kit';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { AppRoute } from '../../../routes/paths';
import { STATUS_META } from '../../../types/person';
import { usePeopleReport } from '../hooks';
import { FiltersRow, HideOnMobile, NameCell, NameSubtitle, PlainTable, PlainTableWrap } from '../styles';

export function PeopleSection() {
  const navigate = useNavigate();
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

  if (loading) return <Skeleton $h="240px" />;
  if (error) return <Empty title={text.feedback.loadError} description={error} />;

  return (
    <div>
      <FiltersRow>
        <RawSelect
          label={text.fields.status}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="all">Todos</option>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </RawSelect>

        <RawSelect label="Turma" value={cohortFilter} onChange={(e) => setCohortFilter(e.target.value)}>
          <option value="all">Todas</option>
          {cohortNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </RawSelect>
      </FiltersRow>

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome…" />

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
                  <HideOnMobile>Turma</HideOnMobile>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id} onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
                    <td>
                      <NameCell>
                        {person.name}
                        <NameSubtitle>{person.cohortNames || '—'}</NameSubtitle>
                      </NameCell>
                    </td>
                    <td>
                      <StatusPill status={person.status} />
                    </td>
                    <HideOnMobile as="td">{person.cohortNames || '—'}</HideOnMobile>
                  </tr>
                ))}
              </tbody>
            </PlainTable>
          </PlainTableWrap>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
