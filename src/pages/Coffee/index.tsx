// React
import { useNavigate } from 'react-router-dom';
// Libs
import {
  Button,
  Empty,
  ModalActions,
  ModalTitle,
  PageHeader,
  Pagination,
  RawSelect,
  SearchInput,
  Skeleton,
  text,
  Typography,
  useAuthCtx,
  useModal,
} from 'bp-kit';
import { Pencil, UserPlus, XCircle } from 'lucide-react';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { AttendanceControl } from './components/AttendanceControl';
import { CreateEventModal } from './components/CreateEventModal';
import { EnrollPersonModal } from './components/EnrollPersonModal';
import { formatDate } from './domain';
import { useCoffee } from './hooks';
import { CountRow, PaginationWrap, SearchRow, SelectorRow } from './styles';

export function CoffeePage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    events,
    canCreateEvent,
    event,
    selectedEventId,
    selectEvent,
    attendees,
    totalCount,
    loading,
    error,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    hasFilter,
    createEvent,
    updateEvent,
    deleteSelectedEvent,
    enrollPerson,
    markAttended,
    markNotAttended,
    markCanceled,
  } = useCoffee();
  const { open, close, modal } = useModal('drawer');

  const canPlan =
    user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin || user?.role === UserRole.Pastor;

  const openCreateModal = () => open(<CreateEventModal close={close} onCreate={createEvent} />);
  const openEditModal = () =>
    event && open(<CreateEventModal close={close} onCreate={updateEvent} onDelete={deleteSelectedEvent} initialDate={event.event_date} />);
  const openEnrollModal = () =>
    selectedEventId && open(<EnrollPersonModal eventId={selectedEventId} close={close} onEnroll={enrollPerson} />);

  const confirmCanceled = (personId: string, personName: string) =>
    open(
      <>
        <ModalTitle onClose={close}>Cancelar presença de {personName}?</ModalTitle>
        <Typography type="p">
          A pessoa avisou que não vem mais e será arquivada. Isso pode ser revertido depois, reativando o cadastro
          dela em Visitantes.
        </Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              await markCanceled(personId);
              close();
            }}
          >
            <XCircle size={16} />
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
        action={
          canPlan ? (
            <Button
              onClick={openCreateModal}
              disabled={!canCreateEvent}
              title={canCreateEvent ? undefined : 'Encerre um café antes de criar outro — só é possível ter 2 ao mesmo tempo.'}
            >
              Novo café
            </Button>
          ) : undefined
        }
      />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !event && (
        <Empty
          title="Nenhum café agendado"
          description={canPlan ? 'Crie o próximo café pelo botão acima.' : 'Aguarde a Equipe de Integração agendar o próximo café.'}
        />
      )}

      {!loading && !error && event && (events.length > 1 || canPlan) && (
        <SelectorRow>
          {events.length > 1 && (
            <RawSelect
              size="sm"
              wrapperStyle={{ flex: 1 }}
              value={selectedEventId ?? ''}
              onChange={(e) => selectEvent(e.target.value)}
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {formatDate(e.event_date)} às {e.event_time.slice(0, 5)}
                </option>
              ))}
            </RawSelect>
          )}
          {canPlan && (
            <Button variant="secondary" size="sm" onClick={openEditModal}>
              <Pencil size={16} />
              Editar café
            </Button>
          )}
        </SelectorRow>
      )}

      {!loading && !error && event && (
        <CountRow>
          <PeopleCount count={totalCount} />
          {canPlan && (
            <Button variant="secondary" size="sm" onClick={openEnrollModal}>
              <UserPlus size={16} />
              Adicionar
            </Button>
          )}
        </CountRow>
      )}

      {!loading && !error && event && (
        <SearchRow>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome…" />
        </SearchRow>
      )}

      {!loading && !error && event && totalCount === 0 && (
        <Empty
          title="Ninguém convidado ainda"
          description={
            hasFilter
              ? 'Nenhum convidado encontrado para os filtros aplicados.'
              : 'Visitantes que aceitaram o convite aparecerão aqui.'
          }
        />
      )}

      {!loading && !error && event && totalCount > 0 && (
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
                      person={attendance.person}
                      canManage={canPlan}
                      onMarkAttended={() => markAttended(attendance.id, attendance.person.id)}
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

      {!loading && !error && event && totalPages > 1 && (
        <PaginationWrap>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </PaginationWrap>
      )}

      {modal}
    </div>
  );
}
