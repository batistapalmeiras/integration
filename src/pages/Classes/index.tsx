// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { BottomSheet, Button, Empty, Skeleton, text, useModal } from 'bp-kit';
import { History, Pencil, Plus } from 'lucide-react';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { useRole } from '../../features/access/useRole';
import { AddButton } from '../../components/AddButton';
import { ArrowSwitcher, SwitcherActionRow } from '../../components/ArrowSwitcher';
import { EnrollPersonModal } from '../../components/EnrollPersonModal';
import { OptionsMenuActions, OptionsMenuButton } from '../../components/OptionsMenu';
import { PeopleCount } from '../../components/PeopleCount';
import { listEnrollablePeople } from '../../repositories/classesRoster';
import { lastLessonDate } from '../../domain/cohortSchedule';
import { todayKey } from '../../domain/dates';
import { AppRoute } from '../../routes/paths';
import { hasRole, LEADERSHIP_ROLES } from '../../types/enums';
import { CreateCohortModal } from './components/CreateCohortModal';
import { EditCohortModal } from './components/EditCohortModal';
import { LessonAttendanceList } from './components/LessonAttendanceList';
import { useClasses } from './hooks';

export function ClassesPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = useRole();
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

  const canManageCohort = hasRole(role, LEADERSHIP_ROLES);
  const canEnroll = canManageCohort;

  const openCreateModal = () =>
    open(<CreateCohortModal close={close} onCreate={createCohort} minDate={minCohortDate} />);
  const openEditModal = () =>
    open(<EditCohortModal lessons={lessons} close={close} onSave={updateLessonDates} onCloseCohort={closeCohort} />);
  const openEnrollModal = () =>
    cohort &&
    open(
      <EnrollPersonModal
        title="Adicionar pessoa à turma"
        loadCandidates={() => listEnrollablePeople(cohort.id)}
        close={close}
        onEnroll={enrollPerson}
      />,
    );

  const openCohortMenu = () => setMenuOpen(true);

  const cohortIndex = cohorts.findIndex((c) => c.id === selectedCohortId);

  return (
    <div>
      <PageHeader
        title="Turma de Integração"
      />

      {!loading && !error && cohort && (
        <>
          <ArrowSwitcher
            title={cohort.name}
            previousLabel="Turma anterior"
            nextLabel="Próxima turma"
            onPrevious={cohortIndex > 0 ? () => selectCohort(cohorts[cohortIndex - 1].id) : undefined}
            onNext={cohortIndex < cohorts.length - 1 ? () => selectCohort(cohorts[cohortIndex + 1].id) : undefined}
            action={canManageCohort && <OptionsMenuButton label="Opções da turma" onClick={openCohortMenu} />}
          />
        </>
      )}

      {!loading && !error && !cohort && canManageCohort && (
        <SwitcherActionRow>
          <OptionsMenuButton label="Opções da turma" onClick={openCohortMenu} />
        </SwitcherActionRow>
      )}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !cohort && (
        <Empty
          title="Nenhuma turma ativa"
          description={
            canManageCohort
              ? 'Abra a próxima turma pelas opções (⋯).'
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
          Adicionar pessoa
        </AddButton>
      )}

      {menuOpen && (
        <BottomSheet title="Turma de Integração" height="half" onClose={() => setMenuOpen(false)}>
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
              setMenuOpen(false);
              openCreateModal();
            }}
          >
            <Plus size={16} />
            Turma
          </Button>
          {cohort && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setMenuOpen(false);
                openEditModal();
              }}
            >
              <Pencil size={16} />
              Editar
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => navigate(`${AppRoute.Reports}/turmas`)}>
            <History size={16} />
            Histórico
          </Button>
          </OptionsMenuActions>
        </BottomSheet>
      )}
      {modal}
    </div>
  );
}
