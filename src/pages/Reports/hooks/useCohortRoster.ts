// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { PersonStatus } from '../../../types/person';
import { CohortRosterRow, CohortRow } from '../types';

export function useCohortRoster(cohortId: string) {
  const [cohort, setCohort] = useState<CohortRow | null>(null);
  const [roster, setRoster] = useState<CohortRosterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: cohortData, error: cohortError } = await supabase.from('cohorts').select('*').eq('id', cohortId).single();
    if (cohortError) {
      setError(cohortError.message);
      setLoading(false);
      return;
    }

    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('id, person:people(id,name,status)')
      .eq('cohort_id', cohortId);

    if (enrollmentsError) {
      setError(enrollmentsError.message);
      setLoading(false);
      return;
    }

    const { data: summaryData, error: summaryError } = await supabase
      .from('enrollment_attendance_summary')
      .select('enrollment_id, lessons_attended')
      .eq('cohort_id', cohortId);

    if (summaryError) {
      setError(summaryError.message);
      setLoading(false);
      return;
    }

    const { data: lessonsData, error: lessonsError } = await supabase.from('lessons').select('id').eq('cohort_id', cohortId);

    if (lessonsError) {
      setError(lessonsError.message);
      setLoading(false);
      return;
    }

    const enrollments = (enrollmentsData ?? []) as unknown as { id: string; person: { id: string; name: string; status: PersonStatus } }[];
    const attendedByEnrollment = new Map((summaryData ?? []).map((s) => [s.enrollment_id as string, s.lessons_attended as number]));
    const totalLessons = (lessonsData ?? []).length || 4;

    setCohort({
      id: cohortData.id,
      name: cohortData.name,
      status: cohortData.status,
      createdAt: cohortData.created_at,
      enrollmentCount: enrollments.length,
    });

    setRoster(
      enrollments.map((enrollment) => ({
        enrollmentId: enrollment.id,
        personId: enrollment.person.id,
        name: enrollment.person.name,
        status: enrollment.person.status,
        lessonsAttended: attendedByEnrollment.get(enrollment.id) ?? 0,
        totalLessons,
      })),
    );
    setLoading(false);
  }, [cohortId]);

  useEffect(() => {
    load();
  }, [load]);

  const closeCohort = async () => {
    if (!cohort) return;
    const { error: closeError } = await supabase.from('cohorts').update({ status: 'closed' }).eq('id', cohort.id);
    if (closeError) throw closeError;
    await load();
  };

  return { cohort, roster, loading, error, closeCohort };
}
