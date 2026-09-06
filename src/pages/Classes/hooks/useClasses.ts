// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { getUpcomingCoffeeEventDate } from '../../../domain/cafeSchedule';
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline } from '../../../types/person';
import { formatDate, weeklyLessonDates } from '../domain';
import { loadSavedFilters, saveFilters } from '../persistence';
import { Cohort, EnrollmentRow, Lesson, LessonAttendance } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useClasses() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: cohortData, error: cohortError } = await supabase
      .from('cohorts')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (cohortError) {
      setError(cohortError.message);
      setLoading(false);
      return;
    }

    setCohort((cohortData as Cohort | null) ?? null);

    if (!cohortData) {
      setLessons([]);
      setAllEnrollments([]);
      setPage(1);
      setLoading(false);
      return;
    }

    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('cohort_id', cohortData.id)
      .order('number', { ascending: true });

    if (lessonError) {
      setError(lessonError.message);
      setLoading(false);
      return;
    }

    setLessons((lessonData ?? []) as Lesson[]);

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, person:people(id,name,status)')
      .eq('cohort_id', cohortData.id);

    if (enrollmentError) {
      setError(enrollmentError.message);
      setLoading(false);
      return;
    }

    const lessonIds = (lessonData ?? []).map((l) => l.id);
    const { data: attendanceData, error: attendanceError } = lessonIds.length
      ? await supabase.from('lesson_attendance').select('*').in('lesson_id', lessonIds)
      : { data: [], error: null };

    if (attendanceError) {
      setError(attendanceError.message);
      setLoading(false);
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
      },
    );

    rows.sort((a, b) => comparePeopleByPipeline(a.person, b.person));
    setAllEnrollments(rows);
    setPage(1);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createCohort = async (firstLessonDate: string) => {
    const lessonDates = weeklyLessonDates(firstLessonDate);
    const name = `Turma ${formatDate(firstLessonDate)}`;

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

    await load();
  };

  const updateLessonDates = async (lessonDates: [string, string, string, string]) => {
    const results = await Promise.all(
      lessons.map((lesson, index) =>
        supabase.from('lessons').update({ date: lessonDates[index] }).eq('id', lesson.id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    await load();
  };

  const closeCohort = async () => {
    if (!cohort) return;
    const { error: closeError } = await supabase.from('cohorts').update({ status: 'closed' }).eq('id', cohort.id);
    if (closeError) throw closeError;
    await load();
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
    cohort,
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
  };
}
