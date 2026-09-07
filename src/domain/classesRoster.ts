// Libs
import { supabase } from '../lib/supabase';
import { AppRoute } from '../routes/paths';
import { PersonStatus } from '../types/person';

export interface ActiveCohort {
  id: string;
  name: string;
  status: 'active' | 'closed';
}

export interface CohortLesson {
  id: string;
  cohort_id: string;
  number: number;
  date: string;
}

export async function getActiveCohortWithLessons(): Promise<{ cohort: ActiveCohort; lessons: CohortLesson[] } | null> {
  const { data: cohort, error: cohortError } = await supabase.from('cohorts').select('*').eq('status', 'active').maybeSingle();
  if (cohortError) throw cohortError;
  if (!cohort) return null;

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*')
    .eq('cohort_id', cohort.id)
    .order('number', { ascending: true });
  if (lessonsError) throw lessonsError;

  return { cohort: cohort as ActiveCohort, lessons: (lessons ?? []) as CohortLesson[] };
}

export async function hasActiveCohort(): Promise<boolean> {
  const { data, error } = await supabase.from('cohorts').select('id').eq('status', 'active').maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function getPersonCohortName(personId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('cohort:cohorts(name)')
    .eq('person_id', personId);
  if (error) throw error;

  const rows = (data ?? []) as unknown as { cohort: { name: string } }[];
  return rows[0]?.cohort.name ?? null;
}

export async function getPersonEnrollmentId(personId: string, cohortId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('person_id', personId)
    .eq('cohort_id', cohortId)
    .maybeSingle();
  if (error) throw error;
  return (data?.id as string | undefined) ?? null;
}

export async function getLessonAttendanceMap(
  enrollmentId: string,
): Promise<Record<string, { id: string; attended: boolean }>> {
  const { data, error } = await supabase
    .from('lesson_attendance')
    .select('id, lesson_id, attended')
    .eq('enrollment_id', enrollmentId);
  if (error) throw error;

  const map: Record<string, { id: string; attended: boolean }> = {};
  for (const row of data ?? []) {
    map[row.lesson_id as string] = { id: row.id as string, attended: row.attended as boolean };
  }
  return map;
}

export async function toggleLessonAttendance(enrollmentId: string, lessonId: string, attended: boolean): Promise<void> {
  const { error } = await supabase
    .from('lesson_attendance')
    .upsert({ enrollment_id: enrollmentId, lesson_id: lessonId, attended }, { onConflict: 'enrollment_id,lesson_id' });
  if (error) throw error;
}

export interface EnrollablePerson {
  id: string;
  name: string;
  status: PersonStatus;
}

// People eligible to be added to a cohort by hand — anyone not already
// enrolled in it and not archived.
export async function listEnrollablePeople(cohortId: string): Promise<EnrollablePerson[]> {
  const { data: enrolled, error: enrolledError } = await supabase
    .from('enrollments')
    .select('person_id')
    .eq('cohort_id', cohortId);
  if (enrolledError) throw enrolledError;
  const enrolledIds = new Set((enrolled ?? []).map((e) => e.person_id as string));

  const { data, error } = await supabase.from('people').select('id, name, status').neq('status', 'archived').order('name');
  if (error) throw error;
  return (data ?? []).filter((p) => !enrolledIds.has(p.id as string)) as EnrollablePerson[];
}

export async function enrollPerson(personId: string, cohortId: string): Promise<void> {
  const { error } = await supabase.from('enrollments').insert({ person_id: personId, cohort_id: cohortId });
  if (error) throw error;
}

export async function getMakeupLink(enrollmentId: string, lessonId: string): Promise<string> {
  const { data: existing, error: selectError } = await supabase
    .from('lesson_attendance')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (selectError) throw selectError;

  let id = existing?.id as string | undefined;
  if (!id) {
    const { data: created, error: insertError } = await supabase
      .from('lesson_attendance')
      .insert({ enrollment_id: enrollmentId, lesson_id: lessonId, attended: false })
      .select('id')
      .single();
    if (insertError) throw insertError;
    id = created.id as string;
  }

  return `${window.location.origin}${AppRoute.MakeupAttendance}/${id}`;
}
