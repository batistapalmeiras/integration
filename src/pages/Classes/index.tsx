// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Pagination, SearchInput, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { UserPlus } from 'lucide-react';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateCohortModal } from './components/CreateCohortModal';
import { EditCohortModal } from './components/EditCohortModal';
import { EnrollPersonModal } from './components/EnrollPersonModal';
import { useClasses } from './hooks';
import { CountBadge, HeaderActions, PaginationWrap, SearchRow } from './styles';

const MEMBERSHIP_THRESHOLD = 4;

export function ClassesPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    cohort,
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
  const canManageCohort = isAdmin || user?.role === UserRole.Teacher || isPastor;
  // Só Pastor e Admin podem matricular pessoas na turma — o professor
  // acompanha a turma, mas não decide quem entra nela.
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
          cohort ? (
            <HeaderActions>
              {canEnroll && (
                <Button variant="secondary" onClick={openEnrollModal}>
                  <UserPlus size={16} />
                  Adicionar
                </Button>
              )}
              {canManageCohort && (
                <Button variant="secondary" onClick={openEditModal}>
                  Editar aulas
                </Button>
              )}
            </HeaderActions>
          ) : (
            canManageCohort && <Button onClick={openCreateModal}>Nova turma</Button>
          )
        }
      />

      {!loading && !error && cohort && <PeopleCount count={totalCount} />}

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
