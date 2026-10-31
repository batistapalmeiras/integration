// React
import { useNavigate } from 'react-router-dom';
// Libs
import {
  Button,
  Empty,
  ModalTitle,
  PageHeader,
  RawSelect,
  SearchInput,
  Skeleton,
  text,
  useAuthCtx,
  useMediaQuery,
  useModal,
} from 'bp-kit';
import { Pencil, UserPlus } from 'lucide-react';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { ActionButton } from '../../components/ActionButton';
import { makeupLessonMessage } from '../../domain/whatsapp';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { WhatsAppMessageBox } from '../Visitors/Detail/components/WhatsAppMessageBox';
import { AttendanceGrid } from './components/AttendanceGrid';
import { CreateCohortModal } from './components/CreateCohortModal';
import { EditCohortModal } from './components/EditCohortModal';
import { EnrollPersonModal } from './components/EnrollPersonModal';
import { LessonAttendanceList } from './components/LessonAttendanceList';
import { useClasses } from './hooks';
import { CountRow, SearchRow, SelectorRow } from './styles';
import { EnrollmentRow, Lesson } from './types';

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
    search,
    setSearch,
    hasFilter,
    createCohort,
    updateLessonDates,
    closeCohort,
    enrollPerson,
    toggleAttendance,
    sendMembershipInterest,
    makeupLink,
  } = useClasses();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { open, close, modal } = useModal('drawer');

  const isAdmin = user?.role === UserRole.Admin;
  const isPastor = user?.role === UserRole.Pastor;
  const canManageCohort = isAdmin || isPastor;
  const canEnroll = isAdmin || isPastor;

  const openCreateModal = () => open(<CreateCohortModal close={close} onCreate={createCohort} minDate={minCohortDate} />);
  const openEditModal = () =>
    open(<EditCohortModal lessons={lessons} close={close} onSave={updateLessonDates} onCloseCohort={closeCohort} />);
  const openMakeupModal = async (row: EnrollmentRow, lesson: Lesson) => {
    const link = await makeupLink(row, lesson.id);
    open(
      <>
        <ModalTitle onClose={close}>Reposição da Aula {lesson.number}</ModalTitle>
        <WhatsAppMessageBox
          person={row.person}
          defaultMessage={makeupLessonMessage(row.person.name, lesson.number, link)}
          buttonLabel="Enviar pelo WhatsApp"
          rows={16}
          bare
          onOpen={close}
        />
      </>,
    );
  };
  const openEnrollModal = () =>
    cohort && open(<EnrollPersonModal cohortId={cohort.id} close={close} onEnroll={enrollPerson} />);

  return (
    <div>
      <PageHeader
        title="Turma de Integração"
        subtitle={cohort ? cohort.name : 'Nenhuma turma ativa'}
        action={
          canManageCohort ? (
            <Button
              onClick={openCreateModal}
              disabled={!canCreateCohort}
              title={canCreateCohort ? undefined : 'Encerre uma turma antes de abrir outra — só é possível ter 2 ao mesmo tempo.'}
            >
              Nova turma
            </Button>
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

      {!loading && !error && cohort && totalCount > 0 && !isDesktop && (
        <LessonAttendanceList key={cohort.id} lessons={lessons} rows={enrollments} onToggle={toggleAttendance} />
      )}

      {!loading && !error && cohort && totalCount > 0 && isDesktop && (
        <AttendanceGrid
          lessons={lessons}
          rows={enrollments}
          onToggle={toggleAttendance}
          onOpen={(personId) => navigate(`${AppRoute.Visitors}/${personId}`)}
          onSendInterest={sendMembershipInterest}
          onSendMakeup={openMakeupModal}
        />
      )}

      {modal}
    </div>
  );
}
