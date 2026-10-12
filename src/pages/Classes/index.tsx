// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Pagination, RawSelect, SearchInput, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { Pencil, UserPlus } from 'lucide-react';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { ActionButton } from '../../components/ActionButton';
import { StatusPill } from '../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateCohortModal } from './components/CreateCohortModal';
import { EditCohortModal } from './components/EditCohortModal';
import { EnrollPersonModal } from './components/EnrollPersonModal';
import { useClasses } from './hooks';
import { CountBadge, CountRow, PaginationWrap, SearchRow, SelectorRow } from './styles';

const MEMBERSHIP_THRESHOLD = 4;

export function ClassesPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    cohorts,
    cohort,
    selectedCohortId,
    selectCohort,
    canCreateCohort,
    lessons,
    enrollments,
    totalCount,
    loading,
    error,
    minCohortDate,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    hasFilter,
    createCohort,
    updateLessonDates,
    closeCohort,
    enrollPerson,
  } = useClasses();
  const { open, close, modal } = useModal('drawer');

  const isAdmin = user?.role === UserRole.Admin;
  const isPastor = user?.role === UserRole.Pastor;
  const canManageCohort = isAdmin || isPastor;
  const canEnroll = isAdmin || isPastor;

  const openCreateModal = () => open(<CreateCohortModal close={close} onCreate={createCohort} minDate={minCohortDate} />);
  const openEditModal = () =>
    open(<EditCohortModal lessons={lessons} close={close} onSave={updateLessonDates} onCloseCohort={closeCohort} />);
  const openEnrollModal = () =>
    cohort && open(<EnrollPersonModal cohortId={cohort.id} close={close} onEnroll={enrollPerson} />);

  return (
    <div>
      <PageHeader
        title="Turma de Integração"
        subtitle={cohort ? cohort.name : 'Nenhuma turma ativa'}
        action={
          canManageCohort ? (
            <ActionButton
              onClick={openCreateModal}
              disabled={!canCreateCohort}
              title={canCreateCohort ? undefined : 'Encerre uma turma antes de abrir outra — só é possível ter 2 ao mesmo tempo.'}
            >
              Nova turma
            </ActionButton>
          ) : undefined
        }
      />

      {!loading && !error && cohort && (cohorts.length > 1 || canManageCohort) && (
        <SelectorRow>
          {cohorts.length > 1 && (
            <RawSelect
              size="sm"
              wrapperStyle={{ flex: 1 }}
              value={selectedCohortId ?? ''}
              onChange={(e) => selectCohort(e.target.value)}
            >
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </RawSelect>
          )}
          {canManageCohort && (
            <ActionButton variant="secondary" size="sm" onClick={openEditModal}>
              <Pencil size={16} />
              Editar aulas
            </ActionButton>
          )}
        </SelectorRow>
      )}

      {!loading && !error && cohort && (
        <CountRow>
          <PeopleCount count={totalCount} />
          {canEnroll && (
            <ActionButton variant="secondary" size="sm" onClick={openEnrollModal}>
              <UserPlus size={16} />
              Adicionar
            </ActionButton>
          )}
        </CountRow>
      )}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !cohort && (
        <Empty
          title="Nenhuma turma ativa"
          description={canManageCohort ? 'Abra uma nova turma pelo botão acima.' : 'Aguarde o administrador abrir a próxima turma.'}
        />
      )}

      {!loading && !error && cohort && (
        <SearchRow>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome…" />
        </SearchRow>
      )}

      {!loading && !error && cohort && totalCount === 0 && (
        <Empty
          title="Ninguém matriculado ainda"
          description={
            hasFilter
              ? 'Nenhuma pessoa encontrada para os filtros aplicados.'
              : 'Pessoas convidadas na tela de Café aparecerão aqui.'
          }
        />
      )}

      {!loading && !error && cohort && totalCount > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th>Presenças</Th>
                <Th $shrink>Situação</Th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((row) => {
                const eligible = row.attendedCount >= MEMBERSHIP_THRESHOLD;
                return (
                  <Tr key={row.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${row.person.id}`)}>
                    <Td $truncate title={row.person.name}>
                      {row.person.name}
                    </Td>
                    <Td $shrink>
                      <CountBadge $eligible={eligible}>
                        {row.attendedCount}/{lessons.length}
                      </CountBadge>
                    </Td>
                    <Td $shrink>
                      <StatusPill person={row.person} compact />
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {!loading && !error && cohort && totalPages > 1 && (
        <PaginationWrap>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </PaginationWrap>
      )}

      {modal}
    </div>
  );
}
