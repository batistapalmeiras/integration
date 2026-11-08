// Local
import { supabase } from '../lib/supabase';
import { AppRoute } from '../routes/paths';
import { PersonStatus } from '../types/person';
import { fromIntegration } from './integrationPeople';
import { selectUpcomingCohort } from './cohortSchedule';

interface ActiveCohort {
  id: string;
  name: string;
  status: 'active' | 'closed';
}

interface CohortLesson {
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

async function listOpenCohorts(): Promise<CohortWithLessons[]> {
  const { data, error } = await supabase.from('cohorts').select(COHORT_WITH_LESSONS).eq('status', 'active');
  if (error) throw error;
  return ((data ?? []) as unknown as CohortRow[]).map(toCohortWithLessons);
}

export async function getUpcomingCohortWithLessons(): Promise<CohortWithLessons | null> {
  return selectUpcomingCohort(await listOpenCohorts());
}

export async function hasUpcomingCohort(): Promise<boolean> {
  return !!(await getUpcomingCohortWithLessons());
}

export interface PersonIntegrationClass extends CohortWithLessons {
  enrollmentId: string;
  attendanceByLesson: Record<string, { id: string; attended: boolean }>;
}

interface PersonEnrollmentRow {
  id: string;
  cohort: CohortRow | null;
  lesson_attendance: { id: string; lesson_id: string; attended: boolean }[];
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

  const row = data as unknown as PersonEnrollmentRow | null;
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

  const { data, error } = await fromIntegration(supabase.from('people').select('id, name, status'))
    .eq('status', 'pending_signup')
    .order('name');
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

interface CohortBoardEnrollment {
  id: string;
  cohort_id: string;
  person: { id: string; name: string; status: string; membership_interest_sent_at: string | null };
}

interface CohortBoardAttendance {
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

export interface LessonRef {
  number: number;
  date: string;
}

export interface CohortProgress {
  cohortId: string;
  cohortName: string;
  nextLesson: LessonRef | null;
  enrolled: number;
}

const firstDate = (cohort: CohortWithLessons) =>
  cohort.lessons.reduce((first, lesson) => (lesson.date < first ? lesson.date : first), cohort.lessons[0]?.date ?? '');

export function cohortsProgress(board: CohortBoard, today: string): CohortProgress[] {
  return [...board.cohorts]
    .sort((a, b) => firstDate(b).localeCompare(firstDate(a)))
    .map((cohort) => {
      const nextLesson = [...cohort.lessons].sort((a, b) => a.date.localeCompare(b.date)).find((l) => l.date >= today);
      return {
        cohortId: cohort.cohort.id,
        cohortName: cohort.cohort.name,
        nextLesson: nextLesson ? { number: nextLesson.number, date: nextLesson.date } : null,
        enrolled: board.enrollments.filter((enrollment) => enrollment.cohort_id === cohort.cohort.id).length,
      };
    });
}
