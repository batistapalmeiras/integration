// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Pagination, SearchInput, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { SlidersHorizontal } from 'lucide-react';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { MEMBERSHIP_STATUS_LABELS } from '../../domain/memberRecords';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { ENTRY_TYPE_LABELS } from '../../types/church';
import { PaginationWrap, SearchFiltersRow } from '../Reports/styles';
import { MembersFiltersModal } from './components/MembersFiltersModal';
import { useMembers } from './hooks/useMembers';

export function MembersPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { open, close, modal } = useModal('drawer');
  const {
    members,
    totalCount,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    membershipStatusFilter,
    setMembershipStatusFilter,
    entryTypeFilter,
    setEntryTypeFilter,
    hasFilter,
    loading,
    error,
  } = useMembers();
  const canOpenRecord = user?.role === UserRole.Pastor;

  const activeFilterCount = (membershipStatusFilter.length > 0 ? 1 : 0) + (entryTypeFilter.length > 0 ? 1 : 0);

  const openFilters = () =>
    open(
      <MembersFiltersModal
        close={close}
        membershipStatusFilter={membershipStatusFilter}
        entryTypeFilter={entryTypeFilter}
        onApply={(status, entryType) => {
          setMembershipStatusFilter(status);
          setEntryTypeFilter(entryType);
        }}
      />,
    );

  return (
    <div>
      <PageHeader title="Membros" back />

      {!loading && !error && <PeopleCount count={totalCount} />}

      <SearchFiltersRow>
        <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome…" />
        <Button variant="secondary" size="sm" onClick={openFilters}>
          <SlidersHorizontal size={16} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </SearchFiltersRow>

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && totalCount === 0 && (
        <Empty
          title="Nenhum membro encontrado"
          description={
            hasFilter ? 'Nenhum membro encontrado para os filtros aplicados.' : 'Membros confirmados aparecerão aqui.'
          }
        />
      )}

      {!loading && !error && totalCount > 0 && (
        <>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>{text.fields.name}</Th>
                  <Th $shrink>Situação</Th>
                  <Th $shrink $hideOnMobile>
                    Forma de entrada
                  </Th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <Tr
                    key={member.id}
                    $clickable={canOpenRecord}
                    onClick={canOpenRecord ? () => navigate(`${AppRoute.Members}/${member.id}/ficha`) : undefined}
                  >
                    <Td $truncate title={member.name}>
                      {member.name}
                    </Td>
                    <Td $shrink>{MEMBERSHIP_STATUS_LABELS[member.membership_status]}</Td>
                    <Td $shrink $hideOnMobile>
                      {member.entry_type ? ENTRY_TYPE_LABELS[member.entry_type] : '—'}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          {totalPages > 1 && (
            <PaginationWrap>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </PaginationWrap>
          )}
        </>
      )}

      {modal}
    </div>
  );
}
