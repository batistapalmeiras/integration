// Local
import {
  CohortBoard,
  CohortLesson,
  CohortWithLessons,
  EnrollablePerson,
  PersonIntegrationClass,
  toCohortStatus,
} from '../domain/classesRoster';
import { AppRoute } from '../routes/paths';
import { selectUpcomingCohort } from '../domain/cohortSchedule';
import { supabase } from '../lib/supabase';
import { toPersonStatus } from '../types/person';
import { fromIntegration } from './integrationPeople';

const COHORT_WITH_LESSONS = 'id, name, status, lessons(id, cohort_id, number, date)';

interface CohortRow {
  id: string;
  name: string;
  status: string;
  lessons: CohortLesson[];
}

function toCohortWithLessons({ lessons, status, ...cohort }: CohortRow): CohortWithLessons {
  return {
    cohort: { ...cohort, status: toCohortStatus(status) },
    lessons: [...(lessons ?? [])].sort((a, b) => a.number - b.number),
  };
}

async function listOpenCohorts(): Promise<CohortWithLessons[]> {
  const { data, error } = await supabase.from('cohorts').select(COHORT_WITH_LESSONS).eq('status', 'active');
  if (error) throw error;
  return (data ?? []).map(toCohortWithLessons);
}

export async function getUpcomingCohortWithLessons(): Promise<CohortWithLessons | null> {
  return selectUpcomingCohort(await listOpenCohorts());
}

export async function hasUpcomingCohort(): Promise<boolean> {
  return !!(await getUpcomingCohortWithLessons());
}

export async function getPersonIntegrationClass(personId: string): Promise<PersonIntegrationClass | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`id, cohort:cohorts(${COHORT_WITH_LESSONS}), lesson_attendance(id, lesson_id, attended)`)
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  const row = data;
  if (!row?.cohort) return null;

  const attendanceByLesson: Record<string, { id: string; attended: boolean }> = {};
  for (const attendance of row.lesson_attendance ?? []) {
    attendanceByLesson[attendance.lesson_id] = { id: attendance.id, attended: attendance.attended };
  }
  return { ...toCohortWithLessons(row.cohort), enrollmentId: row.id, attendanceByLesson };
}

export async function toggleLessonAttendance(
  enrollmentId: string,
  lessonId: string,
  attended: boolean,
): Promise<{ id: string; attended: boolean }> {
  const { data, error } = await supabase
    .from('lesson_attendance')
    .upsert({ enrollment_id: enrollmentId, lesson_id: lessonId, attended }, { onConflict: 'enrollment_id,lesson_id' })
    .select('id, attended')
    .single();
  if (error) throw error;
  return data as { id: string; attended: boolean };
}

export async function listEnrollablePeople(cohortId: string): Promise<EnrollablePerson[]> {
  const { data: enrolled, error: enrolledError } = await supabase
    .from('enrollments')
    .select('person_id')
    .eq('cohort_id', cohortId);
  if (enrolledError) throw enrolledError;
  const enrolledIds = new Set((enrolled ?? []).map((row) => row.person_id));

  const { data, error } = await fromIntegration(supabase.from('people').select('id, name, status'))
    .eq('status', 'pending_signup')
    .order('name');
  if (error) throw error;
  return (data ?? [])
    .filter((person) => !enrolledIds.has(person.id))
    .map((person) => ({ ...person, status: toPersonStatus(person.status) }));
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
    id = created.id;
  }

  return `${window.location.origin}${AppRoute.MakeupAttendance}/${id}`;
}

export async function fetchCohortBoard(): Promise<CohortBoard> {
  const cohorts = await listOpenCohorts();
  const cohortIds = cohorts.map((c) => c.cohort.id);
  const lessonIds = cohorts.flatMap((c) => c.lessons.map((l) => l.id));

  if (cohortIds.length === 0) return { cohorts, enrollments: [], attendance: [] };

  const [enrollments, attendance] = await Promise.all([
    supabase
      .from('enrollments')
      .select('id, cohort_id, person:people(id,name,status,membership_interest_sent_at)')
      .in('cohort_id', cohortIds),
    lessonIds.length
      ? supabase.from('lesson_attendance').select('id, enrollment_id, lesson_id, attended').in('lesson_id', lessonIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const failure = enrollments.error ?? attendance.error;
  if (failure) throw failure;

  return {
    cohorts,
    enrollments: enrollments.data ?? [],
    attendance: attendance.data ?? [],
  };
}

export async function listCohortNames(): Promise<string[]> {
  const { data, error } = await supabase.from('cohorts').select('name, enrollments!inner(id)').order('name');
  if (error) throw error;
  return (data ?? []).map((cohort) => cohort.name);
}

export async function createCohort(name: string, lessonDates: string[]): Promise<string> {
  const { data, error } = await supabase.rpc('create_cohort', { p_name: name, p_lesson_dates: lessonDates });
  if (error) throw error;
  return data;
}

export async function updateLessonDates(cohortId: string, lessons: { number: number; date: string }[]): Promise<void> {
  const dates = [...lessons].sort((a, b) => a.number - b.number).map((lesson) => lesson.date);
  const { error } = await supabase.rpc('set_lesson_dates', { p_cohort_id: cohortId, p_lesson_dates: dates });
  if (error) throw error;
}

export async function closeCohort(cohortId: string): Promise<void> {
  const { error } = await supabase.from('cohorts').update({ status: 'closed' }).eq('id', cohortId);
  if (error) throw error;
}
