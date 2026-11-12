// Local
import { timestampDateKey } from '../../../domain/dates';
import { firstNameOf } from '../../../domain/text';
import { STATUS_LABELS } from '../../../types/person';

interface StatusChangeSource {
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  changedAt: string;
  authorName: string | null;
}

export interface TimelineSource {
  visitedOn: string | null;
  changes: StatusChangeSource[];
  upcomingCoffeeDate: string | null;
  cohortName: string | null;
  membershipInterestSentAt: string | null;
}

export interface TimelineEntry {
  date: string;
  at: string | null;
  label: string;
  detail: string | null;
  actor: string | null;
}

export const SYSTEM_ACTOR = 'Sistema';

const PREVIEW_HEAD = 3;

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
      actor: change.authorName ? firstNameOf(change.authorName) : SYSTEM_ACTOR,
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
  if (source.membershipInterestSentAt) {
    entries.push({
      date: timestampDateKey(source.membershipInterestSentAt),
      at: source.membershipInterestSentAt,
      label: 'Ficha de Interesse enviada',
      detail: null,
      actor: null,
    });
  }

  return entries.sort((a, b) => (a.at ?? `${a.date}T00:00:00`).localeCompare(b.at ?? `${b.date}T00:00:00`));
}

export type TimelinePreview = { kind: 'entry'; entry: TimelineEntry } | { kind: 'gap' };

export function previewTimeline(entries: TimelineEntry[]): TimelinePreview[] {
  if (entries.length <= PREVIEW_HEAD + 1) return entries.map((entry) => ({ kind: 'entry', entry }));
  return [
    ...entries.slice(0, PREVIEW_HEAD).map((entry): TimelinePreview => ({ kind: 'entry', entry })),
    { kind: 'gap' },
    { kind: 'entry', entry: entries[entries.length - 1] },
  ];
}
