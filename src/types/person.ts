// Libs
import { Archive, Clock, Coffee, GraduationCap, PhoneCall, RotateCcw, UserCheck } from 'lucide-react';
import type { ComponentType } from 'react';

export type PersonStatus =
  | 'initial_contact'
  | 'retry_contact'
  | 'welcome_coffee'
  | 'integration'
  | 'membership_pending'
  | 'member'
  | 'archived';

export interface Person {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  email: string | null;
  status: PersonStatus;
  notes: string | null;
  whatsapp_opened_at: string | null;
  coffee_retry_used: boolean;
  small_group_id: string | null;
  ministry_id: string | null;
  created_at: string;
  updated_at: string;
}

export type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'muted';

// compactLabel is only set where it actually differs from the full label —
// used in lists/tables where a long label wraps or crowds an action column.
// Single-person views (e.g. the Visitor detail PersonCard) show the full
// label; only pass `compact` to StatusPill in list contexts.
export const STATUS_META: Record<
  PersonStatus,
  { label: string; compactLabel?: string; tone: StatusTone; icon: ComponentType<{ size?: number }> }
> = {
  initial_contact: { label: 'Contato Inicial', tone: 'info', icon: PhoneCall },
  retry_contact: { label: 'Retomar Contato', tone: 'warning', icon: RotateCcw },
  welcome_coffee: { label: 'Café de Boas-vindas', compactLabel: 'Café', tone: 'info', icon: Coffee },
  integration: { label: 'Integração', tone: 'info', icon: GraduationCap },
  membership_pending: { label: 'Membresia', tone: 'warning', icon: Clock },
  member: { label: 'Membro', tone: 'success', icon: UserCheck },
  archived: { label: 'Arquivado', tone: 'danger', icon: Archive },
};

// "Aguardando retorno" isn't a real pipeline status (initial_contact and
// retry_contact still drive every RLS/filter/transition) — it's a display-only
// distinction for a person who already got a WhatsApp message and hasn't had
// an outcome registered yet, vs. one nobody has messaged at all.
export const AWAITING_REPLY_META = {
  label: 'Aguardando Retorno',
  compactLabel: 'Aguardando',
  tone: 'warning' as StatusTone,
  icon: Clock,
};

export interface DisplayStatusInput {
  status: PersonStatus;
  whatsapp_opened_at?: string | null;
}

export function isAwaitingReply(person: DisplayStatusInput): boolean {
  return (person.status === 'initial_contact' || person.status === 'retry_contact') && !!person.whatsapp_opened_at;
}

export function getDisplayStatusMeta(person: DisplayStatusInput) {
  return isAwaitingReply(person) ? AWAITING_REPLY_META : STATUS_META[person.status];
}

// Shared ordering for every list of people in the app: real pipeline stage
// first (STATUS_META's own declaration order, which is the pipeline
// sequence), then whoever still needs a first message before whoever's
// already been messaged and is awaiting a reply, then alphabetically. Lists
// that only ever show one status (e.g. Turma, Membros) just fall through to
// the alphabetical tiebreaker — safe to use everywhere for consistency.
const PIPELINE_ORDER = new Map(Object.keys(STATUS_META).map((status, index) => [status as PersonStatus, index]));

export interface PipelineSortInput extends DisplayStatusInput {
  name: string;
}

export function comparePeopleByPipeline(a: PipelineSortInput, b: PipelineSortInput): number {
  return (
    PIPELINE_ORDER.get(a.status)! - PIPELINE_ORDER.get(b.status)! ||
    Number(isAwaitingReply(a)) - Number(isAwaitingReply(b)) ||
    a.name.localeCompare(b.name, 'pt-BR')
  );
}
