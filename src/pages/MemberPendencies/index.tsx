// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Pagination, RawSelect, SearchInput, Skeleton, text } from 'bp-kit';
import { AlertTriangle } from 'lucide-react';
// Components
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { PENDENCY_LABELS, PendencyField } from '../../domain/memberRecords';
import { AppRoute } from '../../routes/paths';
import { NameCell, NameText, ReviewFlag, Subline } from '../Membership/styles';
import { PageFlexBody, PageFlexWrap, PaginationWrap, SearchFiltersRow } from '../Reports/styles';
// Local
import { useMemberPendencies } from './hooks/useMemberPendencies';

const FIELD_OPTIONS = Object.entries(PENDENCY_LABELS) as [PendencyField, string][];

export function MemberPendenciesPage() {
  const navigate = useNavigate();
  const { rows, total, loading, error, field, setField, search, setSearch, page, setPage, totalPages } =
    useMemberPendencies();

  return (
    <PageFlexWrap>
      <PageHeader title="Pendências" back />

      <PageFlexBody>
        <PeopleCount count={total} />

        <SearchFiltersRow>
          <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome…" />
          <RawSelect
            label="Pendência"
            size="sm"
            value={field ?? ''}
            onChange={(e) => setField((e.target.value || null) as PendencyField | null)}
          >
            <option value="">Todas</option>
            {FIELD_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </RawSelect>
        </SearchFiltersRow>

        {loading && <Skeleton $h="240px" />}

        {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

        {!loading && !error && rows.length === 0 && (
          <Empty
            title="Nenhuma pendência"
            description={search || field ? 'Nenhum membro encontrado para esse filtro.' : 'Todas as fichas estão completas.'}
          />
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>{text.fields.name}</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const fields = row.missing_fields.filter((missing) => missing !== 'membership_status');
                    return (
                      <Tr
                        key={row.person_id}
                        $clickable
                        onClick={() => navigate(`${AppRoute.Members}/${row.person_id}/ficha`)}
                      >
                        <Td $truncate title={row.name}>
                          <NameCell>
                            <NameText>{row.name}</NameText>
                            {row.missing_fields.includes('membership_status') && (
                              <ReviewFlag>
                                <AlertTriangle size={12} />
                                {PENDENCY_LABELS.membership_status}
                              </ReviewFlag>
                            )}
                            {fields.length > 0 && (
                              <Subline>Falta: {fields.map((missing) => PENDENCY_LABELS[missing]).join(', ')}</Subline>
                            )}
                          </NameCell>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>

            <PaginationWrap>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </PaginationWrap>
          </>
        )}
      </PageFlexBody>
    </PageFlexWrap>
  );
}
