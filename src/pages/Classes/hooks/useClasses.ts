// React
import { useCallback, useEffect, useRef, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { getUpcomingCoffeeEventDate } from '../../../domain/cafeSchedule';
import {
  CohortBoard,
  CohortWithLessons,
  EnrollablePerson,
  closeCohorts,
  enrollPerson as enrollPersonRow,
  fetchCohortBoard,
  finishedCohortIds,
} from '../../../domain/classesRoster';
import { enrollInIntegrationClass } from '../../../features/visitors';
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { comparePeopleByPipeline } from '../../../types/person';
import { firstLessonDate } from '../../../domain/cohortSchedule';
import { formatDate, weeklyLessonDates } from '../domain';
import { loadSavedFilters, saveFilters } from '../persistence';
import { Cohort, EnrollmentRow, Lesson, LessonAttendance } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_COHORTS = 2;

function sortByFirstLesson(list: CohortWithLessons[]): CohortWithLessons[] {
  return [...list].sort((a, b) =>
    (firstLessonDate(a.lessons) ?? '').localeCompare(firstLessonDate(b.lessons) ?? ''),
  );
}

export function useClasses() {
  const { user } = useAuthCtx();
  const canManage = user?.role === UserRole.Admin || user?.role === UserRole.Pastor;
  const [cohorts, setCohorts] = useState<CohortWithLessons[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [allEnrollments, setAllEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minCohortDate, setMinCohortDate] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const boardRef = useRef<CohortBoard | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ search });
  }, [search]);

  useEffect(() => {
    getUpcomingCoffeeEventDate().then(setMinCohortDate);
  }, []);

  const applyBoard = useCallback((board: CohortBoard, keepSelectionId?: string) => {
    boardRef.current = board;
    const open = sortByFirstLesson(board.cohorts);
    setCohorts(open);

    if (open.length === 0) {
      setSelectedCohortId(null);
      setAllEnrollments([]);
      return;
    }

    const selected = open.find((c) => c.cohort.id === keepSelectionId) ?? open[0];
    setSelectedCohortId(selected.cohort.id);

    const rows: EnrollmentRow[] = board.enrollments
      .filter((e) => e.cohort_id === selected.cohort.id)
      .filter((e) => e.person.status !== 'archived')
      .map((enrollment) => {
        const own = board.attendance.filter((a) => a.enrollment_id === enrollment.id);
        return {
          id: enrollment.id,
          person: enrollment.person as EnrollmentRow['person'],
          attendanceByLesson: Object.fromEntries(own.map((a) => [a.lesson_id, a as LessonAttendance])),
          attendedCount: own.filter((a) => a.attended).length,
        };
      });

    rows.sort((a, b) => comparePeopleByPipeline(a.person, b.person));
    setAllEnrollments(rows);
    setPage(1);
  }, []);

  const load = useCallback(
    async (keepSelectionId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const board = await fetchCohortBoard();

        if (canManage) {
          const finished = finishedCohortIds(board, new Date().toISOString().slice(0, 10));
          if (finished.length > 0) {
            await closeCohorts(finished);
            applyBoard(
              { ...board, cohorts: board.cohorts.filter((c) => !finished.includes(c.cohort.id)) },
              keepSelectionId,
            );
            setLoading(false);
            return;
          }
        }

        applyBoard(board, keepSelectionId);
      } catch (loadError) {
        setError((loadError as Error).message);
      }

      setLoading(false);
    },
    [applyBoard, canManage],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const selected = cohorts.find((c) => c.cohort.id === selectedCohortId) ?? null;
  const cohort = (selected?.cohort as Cohort | undefined) ?? null;
  const lessons = (selected?.lessons as Lesson[] | undefined) ?? [];

  const selectCohort = async (cohortId: string) => {
    if (boardRef.current) applyBoard(boardRef.current, cohortId);
    else await load(cohortId);
  };

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

    await load(newCohort.id as string);
  };

  const updateLessonDates = async (lessonDates: [string, string, string, string]) => {
    const results = await Promise.all(
      lessons.map((lesson, index) =>
        supabase.from('lessons').update({ date: lessonDates[index] }).eq('id', lesson.id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    await load(selectedCohortId ?? undefined);
  };

  const closeCohort = async () => {
    if (!cohort) return;
    const { error: closeError } = await supabase.from('cohorts').update({ status: 'closed' }).eq('id', cohort.id);
    if (closeError) throw closeError;
    await load();
  };

  const enrollPerson = async (person: EnrollablePerson) => {
    if (!cohort) return;
    await enrollPersonRow(person.id, cohort.id);
    await enrollInIntegrationClass(person, user?.id);
    await load(cohort.id);
  };

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const filtered = debouncedSearch
    ? allEnrollments.filter((e) => e.person.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : allEnrollments;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const enrollments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    cohorts: cohorts.map((c) => c.cohort as Cohort),
    cohort,
    selectedCohortId,
    selectCohort,
    canCreateCohort: cohorts.length < MAX_COHORTS,
    lessons,
    enrollments,
    totalCount: filtered.length,
    loading,
    error,
    minCohortDate,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    hasFilter: !!search.trim(),
    createCohort,
    updateLessonDates,
    closeCohort,
    enrollPerson,
  };
}
