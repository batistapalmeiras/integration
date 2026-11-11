// React
import { useNavigate } from 'react-router-dom';
// Libs
import {
  Button,
  Empty,
  ModalActions,
  ModalTitle,
  Pagination,
  Skeleton,
  text,
  Typography,
  useAuthCtx,
  useModal,
  useToast,
} from 'bp-kit';
import { Archive, Check, Eraser, Pencil, Plus, X, XCircle } from 'lucide-react';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { AddButton } from '../../components/AddButton';
import { ArrowSwitcher } from '../../components/ArrowSwitcher';
import { EnrollPersonModal } from '../../components/EnrollPersonModal';
import { PeopleCount } from '../../components/PeopleCount';
import {
  List,
  ListChevron,
  ListGrow,
  ListHeader,
  ListItem,
  ListItemRow,
  ListName,
  ListSlot,
  ListStatusCell,
} from '../../components/List';
import { OptionsMenuActions, OptionsMenuButton } from '../../components/OptionsMenu';
import { StatusPill } from '../../components/StatusPill';
import { canMarkCoffeeAttendance } from '../../domain/cafeSchedule';
import { listEnrollableCoffeePeople } from '../../repositories/cafeSchedule';
import { formatDate, todayKey, weekdayLabel } from '../../domain/dates';
import { AppRoute } from '../../routes/paths';
import { hasRole, INTEGRATION_TEAM_ROLES, LEADERSHIP_ROLES } from '../../types/enums';
import { PaginationWrap } from '../../components/ListLayout';
import { CreateEventModal } from './components/CreateEventModal';
import { useCoffee } from './hooks';
import { AttendeeRow } from './types';
import { IconAction, PersonLink, PresenceChoices, PresenceTag, RowActions } from './styles';

const PRESENCE_LABELS: Record<'came' | 'missed', string> = { came: 'Veio', missed: 'Faltou' };

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
    createEvent,
    updateEvent,
    deleteSelectedEvent,
    enrollPerson,
    setPresence,
    undoPresence,
    clearPresence,
    markCanceled,
  } = useCoffee();
  const { open, close, modal } = useModal('drawer');
  const { show: showToast, toast } = useToast();

  const canPlan = hasRole(user?.role, INTEGRATION_TEAM_ROLES);
  const canAddPeople = hasRole(user?.role, LEADERSHIP_ROLES);

  const openCreateModal = () => open(<CreateEventModal close={close} onCreate={createEvent} />);
  const openEditModal = () =>
    event &&
    open(
      <CreateEventModal
        close={close}
        onCreate={updateEvent}
        onDelete={deleteSelectedEvent}
        initialDate={event.event_date}
      />,
    );
  const openEnrollModal = () =>
    selectedEventId &&
    open(
      <EnrollPersonModal
        title="Adicionar pessoa ao café"
        loadCandidates={() => listEnrollableCoffeePeople(selectedEventId)}
        close={close}
        onEnroll={enrollPerson}
      />,
    );

  const openEventMenu = () =>
    open(
      <>
        <ModalTitle onClose={close}>Café de Boas-vindas</ModalTitle>
        <OptionsMenuActions>
          <Button
            type="button"
            disabled={!canCreateEvent}
            title={
              canCreateEvent ? undefined : 'Encerre um café antes de criar outro — só é possível ter 2 ao mesmo tempo.'
            }
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
          A pessoa avisou que não vem mais e será arquivada. Isso pode ser revertido depois, reativando o cadastro dela
          em Visitantes.
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

  const canMark = !!event && canMarkCoffeeAttendance(event.event_date, todayKey());

  const showError = (e: unknown) =>
    showToast((e as { message?: string }).message ?? 'Não foi possível salvar a presença.');

  const markPresence = async (attendance: AttendeeRow, presence: 'came' | 'missed') => {
    if (presence === attendance.presence) return;
    try {
      await setPresence(attendance, presence);
    } catch (e) {
      showError(e);
      return;
    }
    showToast(`${attendance.person.name}: ${presence === 'came' ? 'veio' : 'faltou'}`, {
      label: 'Desfazer',
      onClick: () => undoPresence(attendance, presence).catch(showError),
    });
  };
  const openChangePresence = (attendance: AttendeeRow) =>
    open(
      <>
        <ModalTitle onClose={close}>Mudar a presença de {attendance.person.name}</ModalTitle>
        <Typography type="p">
          Hoje está marcado como <strong>{PRESENCE_LABELS[attendance.presence ?? 'came']}</strong>. Escolha a resposta
          certa.
        </Typography>
        <PresenceChoices>
          <Button
            type="button"
            variant="secondary"
            disabled={attendance.presence === 'came'}
            onClick={() => {
              close();
              markPresence(attendance, 'came');
            }}
          >
            <Check size={16} />
            Veio
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={attendance.presence === 'missed'}
            onClick={() => {
              close();
              markPresence(attendance, 'missed');
            }}
          >
            <X size={16} />
            Faltou
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              close();
              await clearPresence(attendance).catch(showError);
            }}
          >
            <Eraser size={16} />
            Tirar a marcação
          </Button>
        </PresenceChoices>
      </>,
    );

  const canChangePresence = (attendance: AttendeeRow) =>
    attendance.presenceEditable && !attendance.person.class_invite_sent_at;

  const hasActions = (attendance: AttendeeRow) =>
    canPlan && !attendance.returning && (!canMark || canChangePresence(attendance));
  const showStatus = attendees.some((attendance) => !hasActions(attendance));

  const eventIndex = events.findIndex((e) => e.id === selectedEventId);

  return (
    <div>
      <PageHeader
        title="Café"
        action={
          canPlan &&
          (events.length > 0 ? (
            <OptionsMenuButton label="Opções do café" onClick={openEventMenu} />
          ) : (
            <Button variant="secondary" onClick={openCreateModal}>
              <Plus size={16} />
              Novo café
            </Button>
          ))
        }
      />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && !event && (
        <Empty
          title="Nenhum café agendado"
          description={canPlan ? 'Agende o próximo café pelo botão Novo café.' : 'Aguarde o próximo café ser agendado.'}
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

          <PeopleCount count={totalCount} />

          {totalCount === 0 && (
            <Empty title="Ninguém convidado ainda" description="Visitantes que aceitaram o convite aparecerão aqui." />
          )}

          {totalCount > 0 && (
            <>
              <List>
                <ListHeader aria-hidden="true">
                  <ListGrow>{text.fields.name}</ListGrow>
                  {showStatus && (
                    <>
                      <ListStatusCell>Situação</ListStatusCell>
                      <ListSlot $width={16} />
                    </>
                  )}
                </ListHeader>
                {attendees.map((attendance) => (
                  <ListItem key={attendance.id}>
                    <ListItemRow>
                      <PersonLink
                        type="button"
                        onClick={() => navigate(`${AppRoute.Visitors}/${attendance.person.id}`)}
                      >
                        <ListName>{attendance.person.name}</ListName>
                      </PersonLink>
                      {hasActions(attendance) ? (
                        <RowActions>
                          {!(canMark && attendance.presence) && (
                            <IconAction
                              type="button"
                              aria-label={`Cancelou: ${attendance.person.name} avisou que não vem`}
                              title="Cancelou (avisou que não vem)"
                              onClick={() => confirmCanceled(attendance.person.id, attendance.person.name)}
                            >
                              <Archive size={16} />
                            </IconAction>
                          )}
                          {canMark && attendance.presence && (
                            <PresenceTag
                              $tone={attendance.presence === 'came' ? 'success' : 'danger'}
                              aria-label={`${PRESENCE_LABELS[attendance.presence]}: ${attendance.person.name}. Toque para mudar`}
                              title="Mudar a presença"
                              onClick={() => openChangePresence(attendance)}
                            >
                              {attendance.presence === 'came' ? <Check size={12} /> : <X size={12} />}
                              {PRESENCE_LABELS[attendance.presence]}
                              <Pencil size={10} />
                            </PresenceTag>
                          )}
                          {canMark && !attendance.presence && (
                            <>
                              <IconAction
                                type="button"
                                $tone="negative"
                                aria-label={`Faltou: ${attendance.person.name}`}
                                title="Faltou"
                                aria-pressed={attendance.presence === 'missed'}
                                onClick={() => markPresence(attendance, 'missed')}
                              >
                                <X size={16} />
                              </IconAction>
                              <IconAction
                                type="button"
                                $tone="positive"
                                aria-label={`Veio: ${attendance.person.name}`}
                                title="Veio"
                                aria-pressed={attendance.presence === 'came'}
                                onClick={() => markPresence(attendance, 'came')}
                              >
                                <Check size={16} />
                              </IconAction>
                            </>
                          )}
                        </RowActions>
                      ) : (
                        <ListStatusCell>
                          <StatusPill person={attendance.person} compact />
                        </ListStatusCell>
                      )}
                      <ListChevron
                        label={`Abrir perfil de ${attendance.person.name}`}
                        onClick={() => navigate(`${AppRoute.Visitors}/${attendance.person.id}`)}
                      />
                    </ListItemRow>
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

          {canAddPeople && event.event_date >= todayKey() && (
            <AddButton type="button" onClick={openEnrollModal}>
              <Plus size={18} />
              Adicionar pessoa a este café
            </AddButton>
          )}
        </>
      )}

      {modal}
      {toast}
    </div>
  );
}
