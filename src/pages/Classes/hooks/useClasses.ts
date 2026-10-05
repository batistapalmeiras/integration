// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { getUpcomingCoffeeEventDate } from '../../../domain/cafeSchedule';
import {
  CohortWithLessons,
  EnrollablePerson,
  closeFinishedCohorts,
  enrollPerson as enrollPersonRow,
  listOpenCohorts,
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
// The turma under way plus the next one the pastor already opened — same
// headroom the Café page gives itself, and for the same reason: a third one
// piling up means an earlier cycle was never wrapped up.
const MAX_COHORTS = 2;

// Oldest first (by 1st class), so staff lands on the turma that still needs
// attention instead of jumping to one that hasn't started.
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

  const loadRosterFor = useCallback(async (cohortId: string, lessons: Lesson[]) => {
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, person:people(id,name,status,membership_interest_sent_at)')
      .eq('cohort_id', cohortId);

    if (enrollmentError) {
      setError(enrollmentError.message);
      return;
    }

    const lessonIds = lessons.map((l) => l.id);
    const { data: attendanceData, error: attendanceError } = lessonIds.length
      ? await supabase.from('lesson_attendance').select('*').in('lesson_id', lessonIds)
      : { data: [], error: null };

    if (attendanceError) {
      setError(attendanceError.message);
      return;
    }

    const attendanceRows = (attendanceData ?? []) as LessonAttendance[];
    const rows: EnrollmentRow[] = ((enrollmentData ?? []) as unknown as { id: string; person: EnrollmentRow['person'] }[])
      .filter((enrollment) => enrollment.person.status !== 'archived')
      .map((enrollment) => {
        const own = attendanceRows.filter((a) => a.enrollment_id === enrollment.id);
        const attendanceByLesson = Object.fromEntries(own.map((a) => [a.lesson_id, a]));
        return {
          id: enrollment.id,
          person: enrollment.person,
          attendanceByLesson,
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

      // Before anything is listed, so a turma that just finished steps out
      // of the selector in this same pass. Only the roles RLS lets write
      // cohorts attempt it — for anyone else it would just fail.
      if (canManage) {
        try {
          await closeFinishedCohorts();
        } catch (sweepError) {
          setError((sweepError as Error).message);
        }
      }

      let open: CohortWithLessons[];
      try {
        open = sortByFirstLesson(await listOpenCohorts());
      } catch (loadError) {
        setError((loadError as Error).message);
        setLoading(false);
        return;
      }

      setCohorts(open);
      if (open.length === 0) {
        setSelectedCohortId(null);
        setAllEnrollments([]);
        setLoading(false);
        return;
      }

      const selected = open.find((c) => c.cohort.id === keepSelectionId) ?? open[0];
      setSelectedCohortId(selected.cohort.id);
      await loadRosterFor(selected.cohort.id, selected.lessons);
      setLoading(false);
    },
    [canManage, loadRosterFor],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const selected = cohorts.find((c) => c.cohort.id === selectedCohortId) ?? null;
  const cohort = (selected?.cohort as Cohort | undefined) ?? null;
  const lessons = (selected?.lessons as Lesson[] | undefined) ?? [];

  const selectCohort = async (cohortId: string) => {
    const target = cohorts.find((c) => c.cohort.id === cohortId);
    if (!target) return;
    setLoading(true);
    setSelectedCohortId(cohortId);
    await loadRosterFor(target.cohort.id, target.lessons);
    setLoading(false);
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
