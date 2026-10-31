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
  SearchInput,
  Skeleton,
  text,
  Typography,
  useAuthCtx,
  useModal,
} from 'bp-kit';
import { Archive, Check, Pencil, Plus, X, XCircle } from 'lucide-react';
// Local
import { AddButton } from '../../components/AddButton';
import { ArrowSwitcher } from '../../components/ArrowSwitcher';
import { List, ListItem, ListItemRow } from '../../components/List';
import { OptionsMenuActions, OptionsMenuButton } from '../../components/OptionsMenu';
import { StatusPill } from '../../components/StatusPill';
import { canMarkCoffeeAttendance } from '../../domain/cafeSchedule';
import { todayKey } from '../../domain/dates';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { CreateEventModal } from './components/CreateEventModal';
import { EnrollPersonModal } from './components/EnrollPersonModal';
import { formatDate } from './domain';
import { useCoffee } from './hooks';
import { AttendeeRow } from './types';
import {
  IconAction,
  ListTitle,
  PaginationWrap,
  PersonLink,
  SearchRow,
  SegmentButton,
  Segmented,
} from './styles';

function weekdayLabel(eventDate: string): string {
  const weekday = new Date(`${eventDate}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('-feira', '');
}

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

  const openEventMenu = () =>
    open(
      <>
        <ModalTitle onClose={close}>Café de Boas-vindas</ModalTitle>
        <OptionsMenuActions>
          <Button
            type="button"
            disabled={!canCreateEvent}
            title={canCreateEvent ? undefined : 'Encerre um café antes de criar outro — só é possível ter 2 ao mesmo tempo.'}
            onClick={() => {
              close();
              openCreateModal();
            }}
          >
            <Plus size={16} />
            Novo café
          </Button>
          {event && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                close();
                openEditModal();
              }}
            >
              <Pencil size={16} />
              Editar café
            </Button>
          )}
        </OptionsMenuActions>
      </>,
    );

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

  const eventIndex = events.findIndex((e) => e.id === selectedEventId);
  const canMark = !!event && canMarkCoffeeAttendance(event.event_date, todayKey());

  const personNote = (attendance: AttendeeRow) => {
    if (attendance.attended || !canMark) return null;
    return 'Presença não marcada';
  };

  return (
    <div>
      <PageHeader
        title="Café"
        action={
canPlan && <OptionsMenuButton label="Opções do café" onClick={openEventMenu} />
        }
      />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !event && (
        <Empty
          title="Nenhum café agendado"
          description={canPlan ? 'Agende o próximo café pelo botão de opções acima.' : 'Aguarde o próximo café ser agendado.'}
        />
      )}

      {!loading && !error && event && (
        <>
          <ArrowSwitcher
            title={`${weekdayLabel(event.event_date)}, ${formatDate(event.event_date).slice(0, 5)} · ${event.event_time.slice(0, 5)}`}
            caption={event.event_date === todayKey() ? 'Hoje' : undefined}
            previousLabel="Café anterior"
            nextLabel="Próximo café"
            onPrevious={eventIndex > 0 ? () => selectEvent(events[eventIndex - 1].id) : undefined}
            onNext={eventIndex < events.length - 1 ? () => selectEvent(events[eventIndex + 1].id) : undefined}
          />

          <SearchRow>
            <SearchInput size="sm" value={search} onChange={setSearch} placeholder="Buscar por nome…" />
          </SearchRow>

          {totalCount === 0 && (
            <Empty
              title="Ninguém convidado ainda"
              description={
                hasFilter
                  ? 'Nenhum convidado encontrado para os filtros aplicados.'
                  : 'Visitantes que aceitaram o convite aparecerão aqui.'
              }
            />
          )}

          {totalCount > 0 && (
            <>
              <ListTitle type="h4">Quem veio?</ListTitle>
              <List>
                {attendees.map((attendance) => (
                  <ListItem key={attendance.id}>
                    <ListItemRow>
                      <PersonLink type="button" onClick={() => navigate(`${AppRoute.Visitors}/${attendance.person.id}`)}>
                        <span>{attendance.person.name}</span>
                        {personNote(attendance) && (
                          <Typography type="caption" as="span">
                            {personNote(attendance)}
                          </Typography>
                        )}
                      </PersonLink>
                      {attendance.attended && <StatusPill person={attendance.person} compact />}
                      {canPlan && !attendance.attended && (
                        <IconAction
                          type="button"
                          aria-label={`Cancelou: ${attendance.person.name} avisou que não vem`}
                          title="Cancelou (avisou que não vem)"
                          onClick={() => confirmCanceled(attendance.person.id, attendance.person.name)}
                        >
                          <Archive size={18} />
                        </IconAction>
                      )}
                    </ListItemRow>
                    {canPlan && canMark && !attendance.attended && (
                      <Segmented role="group" aria-label={`Presença de ${attendance.person.name}`}>
                        <SegmentButton
                          type="button"
                          $tone="positive"
                          onClick={() => markAttended(attendance.id, attendance.person.id)}
                        >
                          <Check size={16} />
                          Veio
                        </SegmentButton>
                        <SegmentButton type="button" $tone="negative" onClick={() => markNotAttended(attendance.person.id)}>
                          <X size={16} />
                          Faltou
                        </SegmentButton>
                      </Segmented>
                    )}
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {totalPages > 1 && (
            <PaginationWrap>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </PaginationWrap>
          )}

          {canPlan && event.event_date >= todayKey() && (
            <AddButton type="button" onClick={openEnrollModal}>
              <Plus size={18} />
              Adicionar pessoa a este café
            </AddButton>
          )}
        </>
      )}

      {modal}
    </div>
  );
}
