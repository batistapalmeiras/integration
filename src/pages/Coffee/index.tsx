// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, ModalActions, ModalTitle, PageHeader, Skeleton, text, Typography, useAuthCtx, useModal } from 'bp-kit';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { AttendanceControl } from './components/AttendanceControl';
import { CreateEventModal } from './components/CreateEventModal';
import { formatDate } from './domain';
import { useCoffee } from './hooks';

export function CoffeePage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    event,
    attendees,
    loading,
    error,
    createEvent,
    deleteEvent,
    markAttended,
    markNotAttended,
    markCanceled,
  } = useCoffee();
  const { open, close, modal } = useModal('drawer');

  const canPlan =
    user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin || user?.role === UserRole.Pastor;
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasUpcomingEvent = !!event && event.event_date >= todayKey;

  const openCreateModal = () =>
    open(
      <CreateEventModal
        close={close}
        onCreate={createEvent}
        onDelete={hasUpcomingEvent ? deleteEvent : undefined}
        initialDate={hasUpcomingEvent ? event!.event_date : undefined}
      />,
    );

  const confirmCanceled = (personId: string, personName: string) =>
    open(
      <>
        <ModalTitle>Cancelar presença de {personName}?</ModalTitle>
        <Typography type="p">
          A pessoa avisou que não vem mais e será arquivada. Isso pode ser revertido depois, reativando o cadastro
          dela em Visitantes.
        </Typography>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Voltar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              await markCanceled(personId);
              close();
            }}
          >
            Cancelar presença
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <div>
      <PageHeader
        title="Café de Boas-vindas"
        subtitle={event ? `${formatDate(event.event_date)} às ${event.event_time.slice(0, 5)}` : 'Nenhum café agendado'}
        action={canPlan ? <Button onClick={openCreateModal}>{hasUpcomingEvent ? 'Editar café' : 'Novo café'}</Button> : undefined}
      />

      {!loading && !error && event && <PeopleCount count={attendees.length} />}

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
                <Th $shrink>Situação</Th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((attendance) => (
                <Tr
                  key={attendance.id}
                  $clickable
                  onClick={() => navigate(`${AppRoute.Visitors}/${attendance.person.id}`)}
                >
                  <Td $truncate title={attendance.person.name}>
                    {attendance.person.name}
                  </Td>
                  <Td $shrink onClick={canPlan ? (e: React.MouseEvent) => e.stopPropagation() : undefined}>
                    <AttendanceControl
                      attended={attendance.attended}
                      canManage={canPlan}
                      onMarkAttended={() => markAttended(attendance.id)}
                      onMarkNotAttended={() => markNotAttended(attendance.person.id)}
                      onCanceledByPerson={() => confirmCanceled(attendance.person.id, attendance.person.name)}
                    />
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
