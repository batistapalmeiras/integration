// Libs
import { supabase } from '../lib/supabase';

export function firstSundayOfMonth(monthValue: string): string {
  const [year, month] = monthValue.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const offset = date.getDay() === 0 ? 0 : 7 - date.getDay();
  date.setDate(1 + offset);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function nextWelcomeCoffeeDate(referenceDate = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const todayKey = referenceDate.toISOString().slice(0, 10);

  const thisMonthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthFirstSunday = firstSundayOfMonth(thisMonthValue);
  if (thisMonthFirstSunday >= todayKey) return thisMonthFirstSunday;

  const next = new Date(year, month + 1, 1);
  const nextMonthValue = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  return firstSundayOfMonth(nextMonthValue);
}

export async function findOrCreateCoffeeEvent(eventDate: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('coffee_events')
    .select('id')
    .eq('event_date', eventDate)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from('coffee_events')
    .insert({ event_date: eventDate })
    .select('id')
    .single();
  if (createError) throw createError;
  return created.id as string;
}

export async function attachToNextWelcomeCoffee(personId: string): Promise<void> {
  const eventId = await findOrCreateCoffeeEvent(nextWelcomeCoffeeDate());
  const { error } = await supabase
    .from('coffee_attendance')
    .upsert({ person_id: personId, coffee_event_id: eventId }, { onConflict: 'person_id,coffee_event_id' });
  if (error) throw error;
}
