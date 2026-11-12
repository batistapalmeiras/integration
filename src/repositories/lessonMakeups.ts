// Local
import { LessonMakeup, MakeupNote } from '../domain/lessonMakeups';
import { supabase } from '../lib/supabase';

export async function listRecentMakeupNotes(limit: number): Promise<MakeupNote[]> {
  const { data, error } = await supabase
    .from('lesson_makeups')
    .select(
      'notes, attendance:lesson_attendance!inner(enrollment:enrollments!inner(person:people!inner(id, name)), lesson:lessons(number, date, cohort:cohorts(name)))',
    )
    .not('notes', 'is', null)
    .neq('notes', '');
  if (error) throw error;

  return (data ?? [])
    .sort(
      (a, b) =>
        b.attendance.lesson.date.localeCompare(a.attendance.lesson.date) ||
        b.attendance.lesson.number - a.attendance.lesson.number,
    )
    .slice(0, limit)
    .map((row) => ({
      personId: row.attendance.enrollment.person.id,
      personName: row.attendance.enrollment.person.name,
      lessonNumber: row.attendance.lesson.number,
      cohortName: row.attendance.lesson.cohort.name,
      notes: row.notes,
    }));
}

export async function getPersonLessonMakeups(personId: string): Promise<LessonMakeup[]> {
  const { data, error } = await supabase
    .from('lesson_makeups')
    .select(
      'notes, attendance:lesson_attendance!inner(enrollment:enrollments!inner(person_id), lesson:lessons(number, cohort:cohorts(name)))',
    )
    .eq('attendance.enrollment.person_id', personId);
  if (error) throw error;

  return (data ?? [])
    .map((row) => ({
      lessonNumber: row.attendance.lesson.number,
      cohortName: row.attendance.lesson.cohort.name,
      notes: row.notes,
    }))
    .sort((a, b) => a.lessonNumber - b.lessonNumber);
}
