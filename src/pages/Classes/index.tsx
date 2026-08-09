// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Checkbox, Empty, PageHeader, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
// Local
import { RowActions, Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateCohortModal } from './components/CreateCohortModal';
import { EditCohortModal } from './components/EditCohortModal';
import { formatDate } from './domain';
import { useClasses } from './hooks';
import { CountBadge } from './styles';

const MEMBERSHIP_THRESHOLD = 3;

export function ClassesPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    cohort,
    lessons,
    enrollments,
    loading,
    error,
    createCohort,
    updateLessonDates,
    toggleAttendance,
    promoteToMembershipPending,
  } = useClasses();
  const { open, close, modal } = useModal();

  const isAdmin = user?.role === UserRole.Admin;
  const canRecordAttendance = user?.role === UserRole.Teacher || isAdmin;

  const openCreateModal = () => open(<CreateCohortModal close={close} onCreate={createCohort} />);
  const openEditModal = () => open(<EditCohortModal lessons={lessons} close={close} onSave={updateLessonDates} />);

  return (
    <div>
      <PageHeader
        title="Turma de Integração"
        subtitle={cohort ? cohort.name : 'Nenhuma turma ativa'}
        action={
          isAdmin ? (
            cohort ? (
              <Button variant="secondary" onClick={openEditModal}>
                Editar aulas
              </Button>
            ) : (
              <Button onClick={openCreateModal}>Nova turma</Button>
            )
          ) : undefined
        }
      />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !cohort && (
        <Empty
          title="Nenhuma turma ativa"
          description={isAdmin ? 'Abra uma nova turma pelo botão acima.' : 'Aguarde o administrador abrir a próxima turma.'}
        />
      )}

      {!loading && !error && cohort && enrollments.length === 0 && (
        <Empty title="Ninguém matriculado ainda" description="Pessoas convidadas na tela de Café aparecerão aqui." />
      )}

      {!loading && !error && cohort && enrollments.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                {lessons.map((lesson) => (
                  <Th key={lesson.id}>{`Aula ${lesson.number} (${formatDate(lesson.date)})`}</Th>
                ))}
                <Th>Presenças</Th>
                {isAdmin && <Th>{text.actions.actionsColumn}</Th>}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((row) => {
                const eligible = row.attendedCount >= MEMBERSHIP_THRESHOLD;
                const alreadyPromoted = row.person.status !== 'integration';

                return (
                  <Tr key={row.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${row.person.id}`)}>
                    <Td>{row.person.name}</Td>
                    {lessons.map((lesson) => (
                      <Td key={lesson.id} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={row.attendanceByLesson[lesson.id]?.attended ?? false}
                          disabled={!canRecordAttendance}
                          onChange={(e) => toggleAttendance(row.id, lesson.id, e.target.checked)}
                        />
                      </Td>
                    ))}
                    <Td>
                      <CountBadge $eligible={eligible}>{row.attendedCount}/{lessons.length}</CountBadge>
                    </Td>
                    {isAdmin && (
                      <Td onClick={(e) => e.stopPropagation()}>
                        {eligible && !alreadyPromoted && (
                          <RowActions>
                            <Button size="sm" variant="secondary" onClick={() => promoteToMembershipPending(row)}>
                              Marcar pendente de membresia
                            </Button>
                          </RowActions>
                        )}
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {modal}
    </div>
  );
}
