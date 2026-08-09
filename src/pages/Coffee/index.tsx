// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
// Local
import { RowActions, Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateEventModal } from './components/CreateEventModal';
import { formatDate } from './domain';
import { useCoffee } from './hooks';

export function CoffeePage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { event, attendees, activeCohort, loading, error, createEvent, markAttended, markNotAttended, inviteToClasses } =
    useCoffee();
  const { open, close, modal } = useModal();

  const canPlan = user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin;

  const openCreateModal = () => open(<CreateEventModal close={close} onCreate={createEvent} />);

  return (
    <div>
      <PageHeader
        title="Café de Boas-vindas"
        subtitle={event ? `${formatDate(event.event_date)} às ${event.event_time.slice(0, 5)}` : 'Nenhum café agendado'}
        action={canPlan ? <Button onClick={openCreateModal}>Novo café</Button> : undefined}
      />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !event && (
        <Empty
          title="Nenhum café agendado"
          description={canPlan ? 'Crie o próximo café pelo botão acima.' : 'Aguarde a Equipe de Integração agendar o próximo café.'}
        />
      )}

      {!loading && !error && event && attendees.length === 0 && (
        <Empty title="Ninguém convidado ainda" description="Visitantes que aceitaram o convite aparecerão aqui." />
      )}

      {!loading && !error && event && attendees.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th>{text.fields.phone}</Th>
                <Th>{text.actions.actionsColumn}</Th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((attendance) => (
                <Tr
                  key={attendance.id}
                  $clickable
                  onClick={() => navigate(`${AppRoute.Visitors}/${attendance.person.id}`)}
                >
                  <Td>{attendance.person.name}</Td>
                  <Td>{attendance.person.phone}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    {canPlan && !attendance.attended && (
                      <RowActions>
                        <Button size="sm" variant="secondary" onClick={() => markNotAttended(attendance)}>
                          Não compareceu
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => markAttended(attendance)}>
                          Compareceu
                        </Button>
                      </RowActions>
                    )}
                    {canPlan && attendance.attended && (
                      <RowActions>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={!activeCohort}
                          onClick={() => inviteToClasses(attendance)}
                        >
                          {activeCohort ? 'Convidar para Integração' : 'Nenhuma turma ativa'}
                        </Button>
                      </RowActions>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {modal}
    </div>
  );
}
