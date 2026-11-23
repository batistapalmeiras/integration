// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, BottomSheet, Pagination, SearchInput, Skeleton, text, useMediaQuery, useModal } from 'bp-kit';
import { ArrowUpDown, SlidersHorizontal, Users, X } from 'lucide-react';
// Components
import { CountBadge } from '../../components/CountBadge';
import { CountRow } from '../../components/CountRow';
import { PageHeader } from '../../components/PageHeader';
import { useHideModuleBar } from '../../components/Layout/moduleBar';
import { useInView } from '../../lib/useInView';
// Local
import { useRole } from '../../features/access/useRole';
import { PeopleCount } from '../../components/PeopleCount';
import { useMemberPhotoUrls } from '../../queries/memberPhotos';
import { photoOwnersOf } from '../../repositories/memberPhotos';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { PaginationWrap, SearchFiltersRow } from '../../components/ListLayout';
import { fullRowsPageSize, useGridColumns } from '../../lib/useGridColumns';
import { RECENT_ACCEPTANCE_LABELS } from '../../domain/memberAcceptance';
import { CoupleCards, MemberTileContent } from './components/MemberEntries';
import { MembersFiltersModal } from './components/MembersFiltersModal';
import { MembersTopBar } from './components/MembersTopBar';
import { useMembers } from './hooks/useMembers';
import { MEMBER_SORT_OPTIONS } from './sort';
import { ActiveFilters, MemberCard, MemberGrid, RecentChip } from './styles';

const GRID_PAGE_TARGET = 15;
const GRID_MIN_ROWS = 3;
const TOP_BAR_HEIGHT = 64;

function emptyDescription(coupled: boolean, hasFilter: boolean): string {
  if (hasFilter) return `Nenhum ${coupled ? 'casal' : 'membro'} encontrado para os filtros aplicados.`;
  return coupled ? 'Casais entre membros aparecerão aqui.' : 'Membros confirmados aparecerão aqui.';
}

export function MembersPage() {
  const navigate = useNavigate();
  const role = useRole();
  const { open, close, modal } = useModal('drawer');
  const [sorting, setSorting] = useState(false);
  const mobile = useMediaQuery('(max-width: 744px)');
  const withTopBar = useMediaQuery('(max-width: 1024px)');
  const [searchRowRef, searchRowVisible] = useInView<HTMLDivElement>(TOP_BAR_HEIGHT);
  useHideModuleBar(mobile);
  const [gridColumns, gridRef] = useGridColumns();
  const canOpenRecord = role === UserRole.GeneralAdmin;
  const {
    grouping,
    sort,
    setSort,
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
    () => fullRowsPageSize(gridColumns, GRID_PAGE_TARGET, GRID_MIN_ROWS),
    canOpenRecord,
  );
  const coupled = grouping === 'couple';
  const photoSet = useMemberPhotoUrls(photoOwnersOf(coupled ? couples.flat() : members), ['photo']).data;
  const photoUrls = photoSet?.photo ?? {};
  const openMember = (memberId: string) => navigate(`${AppRoute.Members}/${memberId}`);
  const onOpen = canOpenRecord ? openMember : undefined;

  const clearRecent = () => setFilters(grouping, { ...filters, recent: [] });

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
          title="Membros"
          showFilters={!searchRowVisible}
          filterCount={activeFilterCount}
          onFilters={openFilters}
        />
      ) : (
        <PageHeader title="Membros" back sticky />
      )}

      <SearchFiltersRow ref={searchRowRef}>
        <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone…" />
        <Button variant="secondary" size="sm" onClick={openFilters}>
          <SlidersHorizontal size={16} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </SearchFiltersRow>

      {!coupled && filters.recent.length > 0 && (
        <ActiveFilters>
          <RecentChip type="button" aria-label={`Remover filtro ${RECENT_ACCEPTANCE_LABELS.recent}`} onClick={clearRecent}>
            {RECENT_ACCEPTANCE_LABELS.recent}
            <X size={14} aria-hidden="true" />
          </RecentChip>
        </ActiveFilters>
      )}

      {!loading && !error && (
        <CountRow>
          {coupled ? (
            <CountBadge icon={Users} count={totalCount} singular="casal" plural="casais" />
          ) : (
            <PeopleCount count={totalCount} />
          )}
          <Button variant="secondary" size="sm" aria-label="Ordenar" onClick={() => setSorting(true)}>
            <ArrowUpDown size={16} />
          </Button>
        </CountRow>
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
          {!coupled && (
            <MemberGrid ref={gridRef}>
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  as={canOpenRecord ? 'button' : 'div'}
                  type={canOpenRecord ? 'button' : undefined}
                  $clickable={canOpenRecord}
                  onClick={canOpenRecord ? () => openMember(member.id) : undefined}
                >
                  <MemberTileContent
                    member={member}
                    photoUrl={photoUrls[member.id] ?? null}
                    interactive={canOpenRecord}
                  />
                </MemberCard>
              ))}
            </MemberGrid>
          )}
          {totalPages > 1 && (
            <PaginationWrap>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </PaginationWrap>
          )}
        </>
      )}

      {sorting && (
        <BottomSheet
          title="Ordenar por"
          options={MEMBER_SORT_OPTIONS}
          value={sort}
          onChange={setSort}
          onClose={() => setSorting(false)}
        />
      )}

      {modal}
    </div>
  );
}
