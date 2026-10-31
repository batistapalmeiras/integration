// Local
import { formatTimestampDate } from '../../../domain/dates';
import { isAwaitingReply, type Person } from '../../../types/person';

export type VisitorQueue = 'contact' | 'waiting' | 'archived';

export const VISITOR_QUEUES: VisitorQueue[] = ['contact', 'waiting', 'archived'];

export type VisitorQueuePerson = Pick<
  Person,
  'status' | 'whatsapp_opened_at' | 'coffee_retry_used' | 'created_at' | 'updated_at'
>;

const DAY_MS = 24 * 60 * 60 * 1000;

export function visitorQueue(person: VisitorQueuePerson): VisitorQueue {
  if (person.status === 'archived') return 'archived';
  return isAwaitingReply(person) ? 'waiting' : 'contact';
}

function daysAgo(timestamp: string, now: Date): string {
  const days = Math.max(0, Math.floor((now.getTime() - new Date(timestamp).getTime()) / DAY_MS));
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

export function visitorReason(person: VisitorQueuePerson, attemptDates: string[], now: Date): string {
  const queue = visitorQueue(person);
  if (queue === 'archived') return `Arquivado em ${formatTimestampDate(person.updated_at)}`;
  if (queue === 'waiting') return `Mensagem enviada ${daysAgo(person.whatsapp_opened_at!, now)}`;
  if (person.status === 'initial_contact') return `Primeiro contato · cadastrado em ${formatTimestampDate(person.created_at)}`;
  if (person.coffee_retry_used) return 'Faltou ao café · última tentativa';

  const lastAttempt = [...attemptDates].sort().at(-1);
  const since = lastAttempt ? daysAgo(lastAttempt, now) : daysAgo(person.updated_at, now);
  const silence = since === 'hoje' || since === 'ontem' ? `Sem resposta desde ${since}` : `Sem resposta ${since}`;
  return `${silence} · ${attemptDates.length + 1}ª tentativa`;
}
