// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateCohortModal } from './components/CreateCohortModal';
import { EditCohortModal } from './components/EditCohortModal';
import { useClasses } from './hooks';
import { CountBadge } from './styles';

const MEMBERSHIP_THRESHOLD = 4;

export function ClassesPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { cohort, lessons, enrollments, loading, error, createCohort, updateLessonDates, closeCohort } = useClasses();
  const { open, close, modal } = useModal();

  const isAdmin = user?.role === UserRole.Admin;
  const canManageCohort = isAdmin || user?.role === UserRole.Teacher;

  const openCreateModal = () => open(<CreateCohortModal close={close} onCreate={createCohort} />);
  const openEditModal = () =>
    open(<EditCohortModal lessons={lessons} close={close} onSave={updateLessonDates} onCloseCohort={closeCohort} />);

  return (
    <div>
      <PageHeader
        title="Turma de Integração"
        subtitle={cohort ? cohort.name : 'Nenhuma turma ativa'}
        action={
          canManageCohort ? (
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
          description={canManageCohort ? 'Abra uma nova turma pelo botão acima.' : 'Aguarde o administrador abrir a próxima turma.'}
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
                <Th>Presenças</Th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((row) => {
                const eligible = row.attendedCount >= MEMBERSHIP_THRESHOLD;
                return (
                  <Tr key={row.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${row.person.id}`)}>
                    <Td data-label={text.fields.name}>{row.person.name}</Td>
                    <Td data-label="Presenças">
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

      {modal}
    </div>
  );
}
