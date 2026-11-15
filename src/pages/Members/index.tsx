// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, Pagination, SearchInput, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { SlidersHorizontal } from 'lucide-react';
// Components
import { MemberPhoto } from '../../components/MemberPhoto';
import { ListView, ViewToggle } from '../../components/ViewToggle';
import { PageHeader } from '../../components/PageHeader';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { TonePill } from '../../components/StatusPill';
import { MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_TONES } from '../../domain/memberRecords';
import { useMemberPhotoUrls } from '../../queries/memberPhotos';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { PaginationWrap, SearchFiltersRow } from '../../components/ListLayout';
import { MembersFiltersModal } from './components/MembersFiltersModal';
import { useMembers } from './hooks/useMembers';
import { membersView } from './persistence';
import { MemberCard, MemberCardName, MemberGrid, MemberName, ViewRow } from './styles';

const GRID_PAGE_SIZE = 15;

export function MembersPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { open, close, modal } = useModal('drawer');
  const [view, setView] = useState<ListView>(() => membersView.load() ?? 'list');
  const {
    members,
    totalCount,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    membershipStatusFilter,
    entryTypeFilter,
    setFilters,
    hasFilter,
    loading,
    error,
  } = useMembers(view === 'grid' ? GRID_PAGE_SIZE : undefined);
  const canOpenRecord = user?.role === UserRole.Pastor;
  const photoSet = useMemberPhotoUrls(
    members.filter((member) => member.hasPhoto).map((member) => member.id),
    ['thumb', 'photo'],
  ).data;
  const photoUrls = (view === 'grid' ? photoSet?.photo : photoSet?.thumb) ?? {};
  const openMember = (memberId: string) => navigate(`${AppRoute.Members}/${memberId}`);

  const changeView = (next: ListView) => {
    setView(next);
    membersView.save(next);
  };

  const activeFilterCount = (membershipStatusFilter.length > 0 ? 1 : 0) + (entryTypeFilter.length > 0 ? 1 : 0);

  const openFilters = () =>
    open(
      <MembersFiltersModal
        close={close}
        membershipStatusFilter={membershipStatusFilter}
        entryTypeFilter={entryTypeFilter}
        onApply={setFilters}
      />,
    );

  return (
    <div>
      <PageHeader title="Membros" back sticky />

      {!loading && !error && <PeopleCount count={totalCount} />}

      <SearchFiltersRow>
        <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone…" />
        <Button variant="secondary" size="sm" onClick={openFilters}>
          <SlidersHorizontal size={16} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </SearchFiltersRow>

      <ViewRow>
        <ViewToggle value={view} onChange={changeView} />
      </ViewRow>

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
          {view === 'grid' ? (
            <MemberGrid>
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  as={canOpenRecord ? 'button' : 'div'}
                  type={canOpenRecord ? 'button' : undefined}
                  $clickable={canOpenRecord}
                  onClick={canOpenRecord ? () => openMember(member.id) : undefined}
                >
                  <MemberPhoto url={photoUrls[member.id] ?? null} size={88} />
                  <MemberCardName>{member.name}</MemberCardName>
                  <TonePill $tone={MEMBERSHIP_STATUS_TONES[member.membership_status]}>
                    {MEMBERSHIP_STATUS_LABELS[member.membership_status]}
                  </TonePill>
                </MemberCard>
              ))}
            </MemberGrid>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>{text.fields.name}</Th>
                    <Th $shrink>Situação</Th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <Tr
                      key={member.id}
                      $clickable={canOpenRecord}
                      onClick={canOpenRecord ? () => openMember(member.id) : undefined}
                    >
                      <Td $truncate title={member.name}>
                        <MemberName>
                          <MemberPhoto url={photoUrls[member.id] ?? null} size={48} />
                          <span>{member.name}</span>
                        </MemberName>
                      </Td>
                      <Td $shrink>
                        <TonePill $tone={MEMBERSHIP_STATUS_TONES[member.membership_status]}>
                          {MEMBERSHIP_STATUS_LABELS[member.membership_status]}
                        </TonePill>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}

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
