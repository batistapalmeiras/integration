// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, ModalTitle, PageHeader, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { Pencil, Plus } from 'lucide-react';
// Local
import { AddButton } from '../../components/AddButton';
import { ArrowSwitcher } from '../../components/ArrowSwitcher';
import { OptionsMenuActions, OptionsMenuButton } from '../../components/OptionsMenu';
import { PeopleCount } from '../../components/PeopleCount';
import { lastLessonDate } from '../../domain/cohortSchedule';
import { todayKey } from '../../domain/dates';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateCohortModal } from './components/CreateCohortModal';
import { EditCohortModal } from './components/EditCohortModal';
import { EnrollPersonModal } from './components/EnrollPersonModal';
import { LessonAttendanceList } from './components/LessonAttendanceList';
import { useClasses } from './hooks';

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
    createCohort,
    updateLessonDates,
    closeCohort,
    enrollPerson,
    toggleAttendance,
  } = useClasses();
  const { open, close, modal } = useModal('drawer');

  const isAdmin = user?.role === UserRole.Admin;
  const isPastor = user?.role === UserRole.Pastor;
  const canManageCohort = isAdmin || isPastor;
  const canEnroll = isAdmin || isPastor;

  const openCreateModal = () =>
    open(<CreateCohortModal close={close} onCreate={createCohort} minDate={minCohortDate} />);
  const openEditModal = () =>
    open(<EditCohortModal lessons={lessons} close={close} onSave={updateLessonDates} onCloseCohort={closeCohort} />);
  const openEnrollModal = () =>
    cohort && open(<EnrollPersonModal cohortId={cohort.id} close={close} onEnroll={enrollPerson} />);

  const openCohortMenu = () =>
    open(
      <>
        <ModalTitle onClose={close}>Turma de Integração</ModalTitle>
        <OptionsMenuActions>
          <Button
            type="button"
            disabled={!canCreateCohort}
            title={
              canCreateCohort
                ? undefined
                : 'Encerre uma turma antes de abrir outra — só é possível ter 2 ao mesmo tempo.'
            }
            onClick={() => {
              close();
              openCreateModal();
            }}
          >
            <Plus size={16} />
            Nova turma
          </Button>
          {cohort && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                close();
                openEditModal();
              }}
            >
              <Pencil size={16} />
              Editar aulas
            </Button>
          )}
        </OptionsMenuActions>
      </>,
    );

  const cohortIndex = cohorts.findIndex((c) => c.id === selectedCohortId);

  return (
    <div>
      <PageHeader
        title="Turma de Integração"
        action={canManageCohort && <OptionsMenuButton label="Opções da turma" onClick={openCohortMenu} />}
      />

      {!loading && !error && cohort && (
        <>
          <ArrowSwitcher
            title={cohort.name}
            previousLabel="Turma anterior"
            nextLabel="Próxima turma"
            onPrevious={cohortIndex > 0 ? () => selectCohort(cohorts[cohortIndex - 1].id) : undefined}
            onNext={cohortIndex < cohorts.length - 1 ? () => selectCohort(cohorts[cohortIndex + 1].id) : undefined}
          />
        </>
      )}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !cohort && (
        <Empty
          title="Nenhuma turma ativa"
          description={
            canManageCohort
              ? 'Abra uma nova turma pelo botão de opções acima.'
              : 'Aguarde o administrador abrir a próxima turma.'
          }
        />
      )}

      {!loading && !error && cohort && (
        <LessonAttendanceList
          key={cohort.id}
          lessons={lessons}
          rows={enrollments}
          onToggle={toggleAttendance}
          onOpen={(personId) => navigate(`${AppRoute.Visitors}/${personId}`)}
          summary={<PeopleCount count={totalCount} />}
          empty={
            <Empty
              title="Ninguém matriculado ainda"
              description="Pessoas convidadas na tela de Café aparecerão aqui."
            />
          }
        />
      )}

      {!loading && !error && cohort && canEnroll && (lastLessonDate(lessons) ?? '') >= todayKey() && (
        <AddButton type="button" onClick={openEnrollModal}>
          <Plus size={18} />
          Adicionar pessoa a esta turma
        </AddButton>
      )}

      {modal}
    </div>
  );
}
