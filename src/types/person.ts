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
  small_group: string | null;
  ministry: string | null;
  created_at: string;
  updated_at: string;
}

export type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'muted';

export const STATUS_META: Record<PersonStatus, { label: string; tone: StatusTone; icon: ComponentType<{ size?: number }> }> = {
  initial_contact: { label: 'Contato Inicial', tone: 'info', icon: PhoneCall },
  retry_contact: { label: 'Retomar Contato', tone: 'warning', icon: RotateCcw },
  welcome_coffee: { label: 'Café de Boas-vindas', tone: 'info', icon: Coffee },
  integration: { label: 'Integração', tone: 'info', icon: GraduationCap },
  membership_pending: { label: 'Membresia', tone: 'warning', icon: Clock },
  member: { label: 'Membro', tone: 'success', icon: UserCheck },
  archived: { label: 'Arquivado', tone: 'danger', icon: Archive },
};
