// Libs
import { Archive, ClipboardList, Clock, Coffee, GraduationCap, PhoneCall, RotateCcw, Send, UserCheck } from 'lucide-react';
import type { ComponentType } from 'react';

export type PersonStatus =
  | 'initial_contact'
  | 'retry_contact'
  | 'welcome_coffee'
  | 'pending_signup'
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
  class_invite_sent_at: string | null;
  membership_interest_sent_at: string | null;
  entry_type: string | null;
  statute_agreed_at: string | null;
  coffee_retry_used: boolean;
  small_group_id: string | null;
  ministry_id: string | null;
  created_at: string;
  updated_at: string;
}

export type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'muted';

export const STATUS_META: Record<
  PersonStatus,
  { label: string; compactLabel?: string; tone: StatusTone; icon: ComponentType<{ size?: number }> }
> = {
  initial_contact: { label: 'Contato Inicial', tone: 'info', icon: PhoneCall },
  retry_contact: { label: 'Retomar Contato', tone: 'warning', icon: RotateCcw },
  welcome_coffee: { label: 'Café de Boas-vindas', compactLabel: 'Café', tone: 'info', icon: Coffee },
  pending_signup: { label: 'Aguardando inscrição', compactLabel: 'Inscrição', tone: 'warning', icon: ClipboardList },
  integration: { label: 'Integração', tone: 'info', icon: GraduationCap },
  membership_pending: { label: 'Membresia', tone: 'warning', icon: Clock },
  member: { label: 'Membro', tone: 'success', icon: UserCheck },
  archived: { label: 'Arquivado', tone: 'danger', icon: Archive },
};

export const AWAITING_REPLY_META = {
  label: 'Aguardando Retorno',
  compactLabel: 'Aguardando',
  tone: 'warning' as StatusTone,
  icon: Clock,
};

export const AWAITING_CLASS_SIGNUP_META = {
  label: 'Convite Enviado',
  compactLabel: 'Convite enviado',
  tone: 'info' as StatusTone,
  icon: Send,
};

export const AWAITING_MEMBERSHIP_INTEREST_META = {
  label: 'Ficha Enviada',
  compactLabel: 'Ficha enviada',
  tone: 'info' as StatusTone,
  icon: Send,
};

export interface DisplayStatusInput {
  status: PersonStatus;
  whatsapp_opened_at?: string | null;
  class_invite_sent_at?: string | null;
  membership_interest_sent_at?: string | null;
}

export function isAwaitingReply(person: DisplayStatusInput): boolean {
  return (person.status === 'initial_contact' || person.status === 'retry_contact') && !!person.whatsapp_opened_at;
}

export function isAwaitingClassSignup(person: DisplayStatusInput): boolean {
  return person.status === 'pending_signup' && !!person.class_invite_sent_at;
}

export function isAwaitingMembershipInterest(person: DisplayStatusInput): boolean {
  return person.status === 'integration' && !!person.membership_interest_sent_at;
}

export function getDisplayStatusMeta(person: DisplayStatusInput) {
  if (isAwaitingReply(person)) return AWAITING_REPLY_META;
  if (isAwaitingClassSignup(person)) return AWAITING_CLASS_SIGNUP_META;
  if (isAwaitingMembershipInterest(person)) return AWAITING_MEMBERSHIP_INTEREST_META;
  return STATUS_META[person.status];
}

const PIPELINE_ORDER = new Map(Object.keys(STATUS_META).map((status, index) => [status as PersonStatus, index]));

export interface PipelineSortInput extends DisplayStatusInput {
  name: string;
}

export function comparePeopleByPipeline(a: PipelineSortInput, b: PipelineSortInput): number {
  return (
    PIPELINE_ORDER.get(a.status)! - PIPELINE_ORDER.get(b.status)! ||
    Number(isAwaitingReply(a)) - Number(isAwaitingReply(b)) ||
    Number(isAwaitingClassSignup(a)) - Number(isAwaitingClassSignup(b)) ||
    Number(isAwaitingMembershipInterest(a)) - Number(isAwaitingMembershipInterest(b)) ||
    a.name.localeCompare(b.name, 'pt-BR')
  );
}
