// Local
import { supabase } from '../lib/supabase';

export interface VisitorEvent {
  event: string;
  at: string;
  authorName: string | null;
  fields: string[];
  lesson: number | null;
  cohort: string | null;
}

const asDetail = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? { ...value } : {};

export async function listVisitorEvents(personId: string): Promise<VisitorEvent[]> {
  const { data, error } = await supabase.rpc('list_visitor_events', { p_person_id: personId });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const detail = asDetail(row.detail);
    return {
      event: row.event,
      at: row.created_at,
      authorName: row.author_name,
      fields: Array.isArray(detail.fields) ? detail.fields.flatMap((field) => (typeof field === 'string' ? [field] : [])) : [],
      lesson: typeof detail.lesson === 'number' ? detail.lesson : null,
      cohort: typeof detail.cohort === 'string' ? detail.cohort : null,
    };
  });
}
