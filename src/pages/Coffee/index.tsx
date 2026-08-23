// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, text, Typography, useAuthCtx, useModal } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateEventModal } from './components/CreateEventModal';
import { formatDate } from './domain';
import { useCoffee } from './hooks';

export function CoffeePage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { event, attendees, loading, error, createEvent } = useCoffee();
  const { open, close, modal } = useModal();

  const canPlan = user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin;
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasUpcomingEvent = !!event && event.event_date >= todayKey;

  const openCreateModal = () =>
    open(
      <CreateEventModal
        close={close}
        onCreate={createEvent}
        initialMonth={hasUpcomingEvent ? event!.event_date.slice(0, 7) : undefined}
      />,
    );

  return (
    <div>
      <PageHeader
        title="Café de Boas-vindas"
        subtitle={event ? `${formatDate(event.event_date)} às ${event.event_time.slice(0, 5)}` : 'Nenhum café agendado'}
        action={canPlan ? <Button onClick={openCreateModal}>{hasUpcomingEvent ? 'Editar café' : 'Novo café'}</Button> : undefined}
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
                <Th>Situação</Th>
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
                  <Td>
                    <Typography type="caption">
                      {attendance.attended ? 'Compareceu — aguardando resposta ao convite' : 'Aguardando confirmação de presença'}
                    </Typography>
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
