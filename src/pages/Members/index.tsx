// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, Pagination, SearchInput, Skeleton, text, useMediaQuery, useModal } from 'bp-kit';
import { SlidersHorizontal, Users } from 'lucide-react';
// Components
import { CountBadge } from '../../components/CountBadge';
import { PhotoName } from '../../components/MemberPhoto';
import { ListView, ViewToggle } from '../../components/ViewToggle';
import { PageHeader } from '../../components/PageHeader';
import { useHideModuleBar } from '../../components/Layout/moduleBar';
import { useInView } from '../../lib/useInView';
// Local
import { useRole } from '../../features/access/useRole';
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { TonePill } from '../../components/StatusPill';
import { MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_TONES } from '../../domain/memberRecords';
import { useMemberPhotoUrls } from '../../queries/memberPhotos';
import { photoOwnersOf } from '../../repositories/memberPhotos';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { PaginationWrap, SearchFiltersRow } from '../../components/ListLayout';
import { fullRowsPageSize, useGridColumns } from '../../lib/useGridColumns';
import { CoupleCards, MemberTileContent } from './components/MemberEntries';
import { MembersFiltersModal } from './components/MembersFiltersModal';
import { MembersTopBar } from './components/MembersTopBar';
import { useMembers } from './hooks/useMembers';
import { membersView } from './persistence';
import { MemberCard, MemberGrid, ViewRow } from './styles';

const GRID_PAGE_TARGET = 15;
const TOP_BAR_HEIGHT = 64;

function emptyDescription(coupled: boolean, hasFilter: boolean): string {
  if (hasFilter) return `Nenhum ${coupled ? 'casal' : 'membro'} encontrado para os filtros aplicados.`;
  return coupled ? 'Casais entre membros aparecerão aqui.' : 'Membros confirmados aparecerão aqui.';
}

export function MembersPage() {
  const navigate = useNavigate();
  const role = useRole();
  const { open, close, modal } = useModal('drawer');
  const mobile = useMediaQuery('(max-width: 744px)');
  const withTopBar = useMediaQuery('(max-width: 1024px)');
  const [searchRowRef, searchRowVisible] = useInView<HTMLDivElement>(TOP_BAR_HEIGHT);
  useHideModuleBar(mobile);
  const [view, setView] = useState<ListView>(() => membersView.load() ?? 'list');
  const [gridColumns, gridRef] = useGridColumns();
  const canOpenRecord = role === UserRole.GeneralAdmin;
  const {
    grouping,
    members,
    couples,
    totalCount,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    filters,
    activeFilterCount,
    setFilters,
    hasFilter,
    loading,
    error,
  } = useMembers(
    (current) =>
      current === 'couple' || view === 'grid' ? fullRowsPageSize(gridColumns, GRID_PAGE_TARGET) : undefined,
    canOpenRecord,
  );
  const coupled = grouping === 'couple';
  const shownView: ListView = coupled ? 'grid' : view;
  const photoSet = useMemberPhotoUrls(photoOwnersOf(coupled ? couples.flat() : members), ['thumb', 'photo']).data;
  const photoUrls = (shownView === 'grid' ? photoSet?.photo : photoSet?.thumb) ?? {};
  const openMember = (memberId: string) => navigate(`${AppRoute.Members}/${memberId}`);
  const onOpen = canOpenRecord ? openMember : undefined;

  const changeView = (next: ListView) => {
    setView(next);
    membersView.save(next);
  };

  const openFilters = () =>
    open(
      <MembersFiltersModal
        close={close}
        grouping={grouping}
        couplesAllowed={canOpenRecord}
        filters={filters}
        onApply={setFilters}
      />,
    );

  return (
    <div>
      {withTopBar ? (
        <MembersTopBar
          back={mobile}
          title={mobile ? 'Igreja' : 'Membros'}
          showFilters={!searchRowVisible}
          filterCount={activeFilterCount}
          onFilters={openFilters}
        />
      ) : (
        <PageHeader title="Membros" back sticky />
      )}

      {mobile && <PageHeader title="Membros" />}

      {!loading &&
        !error &&
        (coupled ? (
          <CountBadge icon={Users} count={totalCount} singular="casal" plural="casais" />
        ) : (
          <PeopleCount count={totalCount} />
        ))}

      <SearchFiltersRow ref={searchRowRef}>
        <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone…" />
        <Button variant="secondary" size="sm" onClick={openFilters}>
          <SlidersHorizontal size={16} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </SearchFiltersRow>

      {!coupled && (
        <ViewRow>
          <ViewToggle value={view} onChange={changeView} />
        </ViewRow>
      )}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && totalCount === 0 && (
        <Empty
          title={coupled ? 'Nenhum casal encontrado' : 'Nenhum membro encontrado'}
          description={emptyDescription(coupled, hasFilter)}
        />
      )}

      {!loading && !error && totalCount > 0 && (
        <>
          {coupled && <CoupleCards couples={couples} photoUrls={photoUrls} onOpen={onOpen} gridRef={gridRef} />}
          {!coupled && view === 'grid' && (
            <MemberGrid ref={gridRef}>
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  as={canOpenRecord ? 'button' : 'div'}
                  type={canOpenRecord ? 'button' : undefined}
                  $clickable={canOpenRecord}
                  onClick={canOpenRecord ? () => openMember(member.id) : undefined}
                >
                  <MemberTileContent member={member} photoUrl={photoUrls[member.id] ?? null} />
                </MemberCard>
              ))}
            </MemberGrid>
          )}
          {shownView === 'list' && (
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
                        <PhotoName url={photoUrls[member.id] ?? null}>{member.name}</PhotoName>
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
