// Local
import { supabase } from '../lib/supabase';

export interface MemberEvent {
  event: string;
  at: string;
  authorName: string | null;
  name: string | null;
  role: string | null;
  from: string | null;
  to: string | null;
  fields: string[];
}

interface Detail {
  [key: string]: unknown;
}

const asDetail = (value: unknown): Detail =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? { ...value } : {};

const text = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export async function listMemberEvents(personId: string): Promise<MemberEvent[]> {
  const { data, error } = await supabase.rpc('list_member_events', { p_person_id: personId });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const detail = asDetail(row.detail);
    return {
      event: row.event,
      at: row.created_at,
      authorName: row.author_name,
      name: text(detail.name),
      role: text(detail.role),
      from: text(detail.from),
      to: text(detail.to),
      fields: Array.isArray(detail.fields) ? detail.fields.flatMap((field) => (typeof field === 'string' ? [field] : [])) : [],
    };
  });
}
