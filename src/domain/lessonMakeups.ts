// Local
import { supabase } from '../lib/supabase';

export interface LessonMakeup {
  lessonNumber: number;
  cohortName: string;
  confirmedAt: string | null;
  notes: string | null;
}

interface LessonMakeupRow {
  confirmed_at: string | null;
  notes: string | null;
  attendance: { lesson: { number: number; cohort: { name: string } } };
}

export async function getPersonLessonMakeups(personId: string): Promise<LessonMakeup[]> {
  const { data, error } = await supabase
    .from('lesson_makeups')
    .select(
      'confirmed_at, notes, attendance:lesson_attendance!inner(enrollment:enrollments!inner(person_id), lesson:lessons(number, cohort:cohorts(name)))',
    )
    .eq('attendance.enrollment.person_id', personId);
  if (error) return [];

  return ((data ?? []) as unknown as LessonMakeupRow[])
    .map((row) => ({
      lessonNumber: row.attendance.lesson.number,
      cohortName: row.attendance.lesson.cohort.name,
      confirmedAt: row.confirmed_at,
      notes: row.notes,
    }))
    .sort((a, b) => a.lessonNumber - b.lessonNumber);
}
