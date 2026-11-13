// Local
import { STATUS_LABELS } from '../types/person';
import { isDirectSignup } from './origin';
import { formatDate, timestampDateKey } from './dates';
import { MEMBERSHIP_STATUS_LABELS } from './memberRecords';
import { actorName, sortTimeline, SYSTEM_ACTOR, TimelineEntry } from './timeline';

interface StatusChangeSource {
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  changedAt: string;
  authorName: string | null;
}

interface VisitorEventSource {
  event: string;
  at: string;
  authorName: string | null;
  fields: string[];
  lesson: number | null;
  cohort: string | null;
}

export interface TimelineSource {
  visitedOn: string | null;
  changes: StatusChangeSource[];
  events: VisitorEventSource[];
  upcomingCoffeeDate: string | null;
  cohortName: string | null;
  membershipInterestSentAt: string | null;
}

const SAME_SAVE_WINDOW_MS = 60 * 1000;

function mergeSavedRecords<T extends { event: string; at: string; authorName: string | null; fields: string[] }>(
  events: T[],
): T[] {
  return events.reduce<T[]>((merged, event) => {
    const previous = merged.at(-1);
    const sameSave =
      event.event === 'record_updated' &&
      previous?.event === 'record_updated' &&
      previous.authorName === event.authorName &&
      new Date(event.at).getTime() - new Date(previous.at).getTime() <= SAME_SAVE_WINDOW_MS;
    if (!sameSave) return [...merged, event];
    return [...merged.slice(0, -1), { ...previous, fields: [...new Set([...previous.fields, ...event.fields])] }];
  }, []);
}

const VISITOR_FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  phone: 'Celular',
  age: 'Idade',
  email: 'E-mail',
};

function visitorEventEntry(event: VisitorEventSource): TimelineEntry {
  const base = { date: timestampDateKey(event.at), at: event.at, actor: actorName(event.authorName) };
  switch (event.event) {
    case 'whatsapp_opened':
      return { ...base, label: 'WhatsApp aberto para o contato', detail: null };
    case 'class_invite_sent':
      return { ...base, label: 'Convite para a turma enviado', detail: null };
    case 'membership_interest_sent':
      return { ...base, label: 'Ficha de Interesse enviada', detail: null };
    case 'lesson_attended':
      return { ...base, label: `Presença na aula ${event.lesson} marcada`, detail: event.cohort };
    case 'lesson_unmarked':
      return { ...base, label: `Presença na aula ${event.lesson} desmarcada`, detail: event.cohort };
    default:
      return {
        ...base,
        label: `Dados alterados: ${event.fields.map((field) => VISITOR_FIELD_LABELS[field] ?? field).join(', ')}`,
        detail: null,
      };
  }
}

const AUTOMATIC_NOTES = [
  'Não se inscreveu na turma até o início da primeira aula',
  'Concluiu as aulas de Integração com a ficha de interesse já preenchida',
];

const changeActor = (change: StatusChangeSource): string | null => {
  if (change.authorName) return actorName(change.authorName);
  return change.note && AUTOMATIC_NOTES.includes(change.note) ? SYSTEM_ACTOR : null;
};

const statusName = (status: string | null) => (status ? (STATUS_LABELS[status] ?? status) : 'Sem status');

function changeLabel({ fromStatus, toStatus }: StatusChangeSource, cohortName: string | null): string {
  if (toStatus === 'archived') return 'Arquivado';
  if (fromStatus === 'archived') return 'Reativado';
  if (toStatus === 'retry_contact') {
    if (fromStatus === 'welcome_coffee') return 'Não compareceu ao café';
    return fromStatus === 'retry_contact' ? 'Nova tentativa sem resposta' : 'Contato sem resposta';
  }
  if (toStatus === 'welcome_coffee') return 'Aceitou o convite para o café';
  if (toStatus === 'pending_signup') return 'Compareceu ao Café de boas-vindas';
  if (toStatus === 'integration') return cohortName ? `Inscrito na ${cohortName}` : 'Inscrito na turma de integração';
  if (toStatus === 'membership_pending') return 'Ficha de Interesse de Membresia preenchida';
  if (toStatus === 'member') return 'Confirmado como membro';
  return `${statusName(fromStatus)} → ${statusName(toStatus)}`;
}

export function visitTimeline(source: TimelineSource): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  if (source.visitedOn) {
    entries.push({
      date: source.visitedOn,
      at: null,
      label: 'Primeira visita à igreja',
      detail: null,
      actor: null,
    });
  }

  const lastIntegration = source.changes.findLastIndex((change) => change.toStatus === 'integration');
  source.changes.forEach((change, index) => {
    const label = changeLabel(change, index === lastIntegration ? source.cohortName : null);
    entries.push({
      date: timestampDateKey(change.changedAt),
      at: change.changedAt,
      label,
      detail: change.note && change.note !== label ? change.note : null,
      actor: changeActor(change),
    });
  });

  if (source.upcomingCoffeeDate) {
    entries.push({
      date: source.upcomingCoffeeDate,
      at: null,
      label: 'Café de boas-vindas agendado',
      detail: null,
      actor: null,
    });
  }
  if (
    source.membershipInterestSentAt &&
    !source.events.some((event) => event.event === 'membership_interest_sent')
  ) {
    entries.push({
      date: timestampDateKey(source.membershipInterestSentAt),
      at: source.membershipInterestSentAt,
      label: 'Ficha de Interesse enviada',
      detail: null,
      actor: null,
    });
  }
  mergeSavedRecords(source.events).forEach((event) => entries.push(visitorEventEntry(event)));

  return sortTimeline(entries);
}

interface MemberEventSource {
  event: string;
  at: string;
  authorName: string | null;
  name: string | null;
  role: string | null;
  from: string | null;
  to: string | null;
  fields: string[];
}

export interface MembershipSource {
  origin: string;
  createdAt: string;
  membershipInterestSentAt: string | null;
  councilDate: string | null;
  changes: StatusChangeSource[];
  events: MemberEventSource[];
  communityJoins: { kind: 'small_group' | 'ministry'; name: string; joinedAt: string }[];
  fieldLabel: (column: string) => string;
}

const BULK_JOIN_WINDOW_MS = 24 * 60 * 60 * 1000;
const PASTOR_ACTOR = 'Pastor';

const ROLE_LABELS: Record<string, string> = { leader: 'Líder', host: 'Anfitrião' };

const membershipStatusName = (status: string | null) =>
  Object.entries(MEMBERSHIP_STATUS_LABELS).find(([key]) => key === status)?.[1] ?? status ?? '';

function eventLabel(event: MemberEventSource, fieldLabel: (column: string) => string): string {
  const name = event.name ?? 'grupo removido';
  switch (event.event) {
    case 'membership_status_changed':
      return `Situação alterada de ${membershipStatusName(event.from)} para ${membershipStatusName(event.to)}`;
    case 'council_changed':
      return event.to
        ? `${event.from ? 'Conselho alterado para' : 'Aprovado no Conselho Administrativo de'} ${formatDate(event.to)}`
        : 'Conselho Administrativo removido';
    case 'small_group_joined':
      return `Entrou no Pequeno Grupo ${name}`;
    case 'small_group_left':
      return `Saiu do Pequeno Grupo ${name}`;
    case 'ministry_joined':
      return `Passou a servir em ${name}`;
    case 'ministry_left':
      return `Deixou de servir em ${name}`;
    case 'small_group_role_added':
      return `Passou a ser ${ROLE_LABELS[event.role ?? ''] ?? 'responsável'} do Pequeno Grupo ${name}`;
    case 'small_group_role_removed':
      return `Deixou de ser ${ROLE_LABELS[event.role ?? ''] ?? 'responsável'} do Pequeno Grupo ${name}`;
    case 'ministry_leader_added':
      return `Passou a liderar ${name}`;
    case 'ministry_leader_removed':
      return `Deixou de liderar ${name}`;
    default:
      return `Dados alterados: ${event.fields.map(fieldLabel).join(', ')}`;
  }
}

export function membershipTimeline(source: MembershipSource): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const entry = (
    date: string,
    at: string | null,
    label: string,
    actor: string | null = null,
    detail: string | null = null,
  ): TimelineEntry => ({ date, at, label, detail, actor });

  if (source.origin === 'imported') {
    entries.push(entry(timestampDateKey(source.createdAt), source.createdAt, 'Cadastro importado do sistema antigo'));
  }
  if (source.membershipInterestSentAt) {
    entries.push(
      entry(
        timestampDateKey(source.membershipInterestSentAt),
        source.membershipInterestSentAt,
        'Ficha de Interesse enviada',
      ),
    );
  }
  if (isDirectSignup(source.origin)) {
    source.changes
      .filter((change) => change.toStatus === 'membership_pending')
      .forEach((change) => {
        entries.push(
          entry(
            timestampDateKey(change.changedAt),
            change.changedAt,
            'Preencheu o cadastro de membresia',
            changeActor(change),
          ),
        );
      });
  }
  source.changes
    .filter((change) => change.toStatus === 'member')
    .forEach((change) => {
      entries.push(
        entry(
          timestampDateKey(change.changedAt),
          change.changedAt,
          'Confirmado como membro',
          changeActor(change),
        ),
      );
    });

  if (source.councilDate && !source.events.some((event) => event.event === 'council_changed')) {
    entries.push(entry(source.councilDate, null, 'Aprovado no Conselho Administrativo'));
  }

  const memberSince = new Date(source.createdAt).getTime();
  const recordedJoin = (kind: string, name: string) =>
    source.events.some((event) => event.event === `${kind}_joined` && event.name === name);
  source.communityJoins
    .filter((join) => source.origin !== 'imported' || new Date(join.joinedAt).getTime() - memberSince > BULK_JOIN_WINDOW_MS)
    .filter((join) => !recordedJoin(join.kind, join.name))
    .forEach((join) => {
      entries.push(
        entry(
          timestampDateKey(join.joinedAt),
          join.joinedAt,
          join.kind === 'small_group' ? `Entrou no Pequeno Grupo ${join.name}` : `Passou a servir em ${join.name}`,
          PASTOR_ACTOR,
        ),
      );
    });

  mergeSavedRecords(source.events).forEach((event) => {
    entries.push(
      entry(
        timestampDateKey(event.at),
        event.at,
        eventLabel(event, source.fieldLabel),
        actorName(event.authorName),
      ),
    );
  });

  return sortTimeline(entries);
}
