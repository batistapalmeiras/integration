// Libs
import { isCohortFinished, selectUpcomingCohort } from './cohortSchedule';
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

export interface CohortWithLessons {
  cohort: ActiveCohort;
  lessons: CohortLesson[];
}

const COHORT_WITH_LESSONS = 'id, name, status, lessons(id, cohort_id, number, date)';

interface CohortRow extends ActiveCohort {
  lessons: CohortLesson[];
}

function toCohortWithLessons(row: CohortRow): CohortWithLessons {
  const { lessons, ...cohort } = row;
  return { cohort, lessons: [...(lessons ?? [])].sort((a, b) => a.number - b.number) };
}

export async function listOpenCohorts(): Promise<CohortWithLessons[]> {
  const { data, error } = await supabase.from('cohorts').select(COHORT_WITH_LESSONS).eq('status', 'active');
  if (error) throw error;
  return ((data ?? []) as unknown as CohortRow[]).map(toCohortWithLessons);
}

export async function listAllCohorts(): Promise<CohortWithLessons[]> {
  const { data, error } = await supabase.from('cohorts').select(COHORT_WITH_LESSONS);
  if (error) throw error;
  return ((data ?? []) as unknown as CohortRow[]).map(toCohortWithLessons);
}

export async function getUpcomingCohortWithLessons(): Promise<CohortWithLessons | null> {
  return selectUpcomingCohort(await listOpenCohorts());
}

export async function hasUpcomingCohort(): Promise<boolean> {
  return !!(await getUpcomingCohortWithLessons());
}

export async function getPersonCohortWithLessons(personId: string): Promise<CohortWithLessons | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`cohort:cohorts(${COHORT_WITH_LESSONS})`)
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  const row = data as unknown as { cohort: CohortRow } | null;
  return row ? toCohortWithLessons(row.cohort) : null;
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

export interface EnrollablePerson {
  id: string;
  name: string;
  status: PersonStatus;
}

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

export async function closeFinishedCohorts(): Promise<number> {
  const open = await listOpenCohorts();
  if (open.length === 0) return 0;

  const { data, error } = await supabase
    .from('enrollments')
    .select('cohort_id, person:people(status)')
    .in('cohort_id', open.map((c) => c.cohort.id));
  if (error) throw error;

  const stillGoing = new Map<string, number>();
  for (const row of (data ?? []) as unknown as { cohort_id: string; person: { status: string } | null }[]) {
    if (row.person?.status !== 'integration') continue;
    stillGoing.set(row.cohort_id, (stillGoing.get(row.cohort_id) ?? 0) + 1);
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const finished = open
    .filter((c) => isCohortFinished(c.lessons, stillGoing.get(c.cohort.id) ?? 0, todayKey))
    .map((c) => c.cohort.id);
  if (finished.length === 0) return 0;

  const { data: closed, error: closeError } = await supabase
    .from('cohorts')
    .update({ status: 'closed' })
    .in('id', finished)
    .eq('status', 'active')
    .select('id');
  if (closeError) throw closeError;
  return (closed ?? []).length;
}

export interface CohortBoardEnrollment {
  id: string;
  cohort_id: string;
  person: { id: string; name: string; status: string; membership_interest_sent_at: string | null };
}

export interface CohortBoardAttendance {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  attended: boolean;
}

export interface CohortBoard {
  cohorts: CohortWithLessons[];
  enrollments: CohortBoardEnrollment[];
  attendance: CohortBoardAttendance[];
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
    enrollments: (enrollments.data ?? []) as unknown as CohortBoardEnrollment[],
    attendance: (attendance.data ?? []) as unknown as CohortBoardAttendance[],
  };
}

export function finishedCohortIds(board: CohortBoard, todayKey: string): string[] {
  return board.cohorts
    .filter((c) => {
      const stillGoing = board.enrollments.filter(
        (e) => e.cohort_id === c.cohort.id && e.person?.status === 'integration',
      ).length;
      return isCohortFinished(c.lessons, stillGoing, todayKey);
    })
    .map((c) => c.cohort.id);
}

export async function closeCohorts(cohortIds: string[]): Promise<number> {
  if (cohortIds.length === 0) return 0;

  const { data, error } = await supabase
    .from('cohorts')
    .update({ status: 'closed' })
    .in('id', cohortIds)
    .eq('status', 'active')
    .select('id');
  if (error) throw error;
  return (data ?? []).length;
}
