// React
import { useMemo, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  CohortBoard,
  CohortWithLessons,
  EnrollablePerson,
  enrollPerson as enrollPersonRow,
  fetchCohortBoard,
  toggleLessonAttendance,
} from '../../../domain/classesRoster';
import { enrollInIntegrationClass } from '../../../features/visitors';
import { errorMessage, fetchQuery, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { useUpcomingCoffeeEventDate } from '../../../queries/reference';
import { comparePeopleByPipeline } from '../../../types/person';
import { firstLessonDate } from '../../../domain/cohortSchedule';
import { formatDate } from '../../../domain/dates';
import { weeklyLessonDates } from '../domain';
import { Cohort, EnrollmentRow, Lesson, LessonAttendance } from '../types';

const MAX_COHORTS = 2;

function sortByFirstLesson(list: CohortWithLessons[]): CohortWithLessons[] {
  return [...list].sort((a, b) =>
    (firstLessonDate(a.lessons) ?? '').localeCompare(firstLessonDate(b.lessons) ?? ''),
  );
}

function buildEnrollments(board: CohortBoard, cohortId: string): EnrollmentRow[] {
  return board.enrollments
    .filter((e) => e.cohort_id === cohortId)
    .filter((e) => e.person.status !== 'archived')
    .map((enrollment) => {
      const own = board.attendance.filter((a) => a.enrollment_id === enrollment.id);
      return {
        id: enrollment.id,
        person: enrollment.person as EnrollmentRow['person'],
        attendanceByLesson: Object.fromEntries(own.map((a) => [a.lesson_id, a as LessonAttendance])),
        attendedCount: own.filter((a) => a.attended).length,
      };
    })
    .sort((a, b) => comparePeopleByPipeline(a.person, b.person));
}

export function useClasses() {
  const { user } = useAuthCtx();
  const boardQuery = useQuery(queryKeys.cohortBoard, fetchCohortBoard);
  const board = boardQuery.data;
  const [selectedCohortIdState, setSelectedCohortIdState] = useState<string | null>(null);
  const minCohortDate = useUpcomingCoffeeEventDate().data ?? null;

  const refreshBoard = () => fetchQuery(queryKeys.cohortBoard, fetchCohortBoard);

  const cohorts = useMemo(() => (board ? sortByFirstLesson(board.cohorts) : []), [board]);
  const selected = cohorts.find((c) => c.cohort.id === selectedCohortIdState) ?? cohorts.at(-1) ?? null;
  const selectedCohortId = selected?.cohort.id ?? null;
  const cohort = (selected?.cohort as Cohort | undefined) ?? null;
  const lessons = (selected?.lessons as Lesson[] | undefined) ?? [];
  const allEnrollments = useMemo(
    () => (board && selectedCohortId ? buildEnrollments(board, selectedCohortId) : []),
    [board, selectedCohortId],
  );

  const selectCohort = async (cohortId: string) => setSelectedCohortIdState(cohortId);

  const createCohort = async (firstDate: string) => {
    if (cohorts.length >= MAX_COHORTS) {
      throw new Error(`Só é possível ter ${MAX_COHORTS} turmas ao mesmo tempo — encerre uma antes de abrir outra.`);
    }

    const lessonDates = weeklyLessonDates(firstDate);
    const name = `Turma ${formatDate(firstDate)}`;

    const { data: newCohort, error: cohortError } = await supabase
      .from('cohorts')
      .insert({ name })
      .select()
      .single();
    if (cohortError) throw cohortError;

    const { error: lessonsError } = await supabase.from('lessons').insert(
      lessonDates.map((date, index) => ({ cohort_id: newCohort.id, number: index + 1, date })),
    );
    if (lessonsError) throw lessonsError;

    setSelectedCohortIdState(newCohort.id as string);
    await refreshBoard();
  };

  const updateLessonDates = async (lessonDates: [string, string, string, string]) => {
    const results = await Promise.all(
      lessons.map((lesson, index) =>
        supabase.from('lessons').update({ date: lessonDates[index] }).eq('id', lesson.id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    await refreshBoard();
  };

  const closeCohort = async () => {
    if (!cohort) return;
    const { error: closeError } = await supabase.from('cohorts').update({ status: 'closed' }).eq('id', cohort.id);
    if (closeError) throw closeError;
    setSelectedCohortIdState(null);
    await refreshBoard();
  };

  const enrollPerson = async (person: EnrollablePerson) => {
    if (!cohort) return;
    await enrollPersonRow(person.id, cohort.id);
    await enrollInIntegrationClass(person, user?.id);
    await refreshBoard();
  };

  const replaceAttendance = (row: LessonAttendance) =>
    setQueryData<CohortBoard>(queryKeys.cohortBoard, (current) => {
      const value = current as CohortBoard;
      const others = value.attendance.filter((a) => !(a.enrollment_id === row.enrollment_id && a.lesson_id === row.lesson_id));
      return { ...value, attendance: [...others, row] };
    });

  const toggleAttendance = async (enrollmentId: string, lessonId: string, attended: boolean) => {
    const previous = board?.attendance.find((a) => a.enrollment_id === enrollmentId && a.lesson_id === lessonId);
    replaceAttendance({ id: previous?.id ?? '', enrollment_id: enrollmentId, lesson_id: lessonId, attended });
    const saved = await toggleLessonAttendance(enrollmentId, lessonId, attended);
    replaceAttendance({ id: saved.id, enrollment_id: enrollmentId, lesson_id: lessonId, attended: saved.attended });
  };

  return {
    cohorts: cohorts.map((c) => c.cohort as Cohort),
    cohort,
    selectedCohortId,
    selectCohort,
    canCreateCohort: cohorts.length < MAX_COHORTS,
    lessons,
    enrollments: allEnrollments,
    totalCount: allEnrollments.length,
    loading: boardQuery.loading,
    error: errorMessage(boardQuery.error),
    minCohortDate,
    createCohort,
    updateLessonDates,
    closeCohort,
    enrollPerson,
    toggleAttendance,
  };
}
