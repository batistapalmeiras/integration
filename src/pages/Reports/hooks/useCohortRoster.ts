// Local
import { errorMessage, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline, PersonStatus } from '../../../types/person';
import { CohortRosterRow, CohortRow } from '../types';

interface CohortRosterData {
  cohort: CohortRow;
  roster: CohortRosterRow[];
}

async function loadCohortRoster(cohortId: string): Promise<CohortRosterData> {
  const [cohortResult, enrollmentsResult, summaryResult, lessonsResult] = await Promise.all([
    supabase.from('cohorts').select('*').eq('id', cohortId).single(),
    supabase.from('enrollments').select('id, person:people(id,name,status)').eq('cohort_id', cohortId),
    supabase.from('enrollment_attendance_summary').select('enrollment_id, lessons_attended').eq('cohort_id', cohortId),
    supabase.from('lessons').select('id').eq('cohort_id', cohortId),
  ]);
  const failure = cohortResult.error ?? enrollmentsResult.error ?? summaryResult.error ?? lessonsResult.error;
  if (failure) throw failure;

  const cohortData = cohortResult.data;
  const enrollments = (enrollmentsResult.data ?? []) as unknown as {
    id: string;
    person: { id: string; name: string; status: PersonStatus };
  }[];
  const attendedByEnrollment = new Map(
    (summaryResult.data ?? []).map((s) => [s.enrollment_id as string, s.lessons_attended as number]),
  );
  const totalLessons = (lessonsResult.data ?? []).length || 4;

  return {
    cohort: {
      id: cohortData.id,
      name: cohortData.name,
      status: cohortData.status,
      createdAt: cohortData.created_at,
      enrollmentCount: enrollments.length,
    },
    roster: enrollments
      .map((enrollment) => ({
        enrollmentId: enrollment.id,
        personId: enrollment.person.id,
        name: enrollment.person.name,
        status: enrollment.person.status,
        lessonsAttended: attendedByEnrollment.get(enrollment.id) ?? 0,
        totalLessons,
      }))
      .sort(comparePeopleByPipeline),
  };
}

export function useCohortRoster(cohortId: string) {
  const query = useQuery(queryKeys.cohortRoster(cohortId), () => loadCohortRoster(cohortId), { enabled: !!cohortId });
  const cohort = query.data?.cohort ?? null;

  const closeCohort = async () => {
    if (!cohort) return;
    const { error: closeError } = await supabase.from('cohorts').update({ status: 'closed' }).eq('id', cohort.id);
    if (closeError) throw closeError;
    setQueryData<CohortRosterData>(queryKeys.cohortRoster(cohortId), (current) => ({
      ...(current as CohortRosterData),
      cohort: { ...(current as CohortRosterData).cohort, status: 'closed' },
    }));
  };

  return { cohort, roster: query.data?.roster ?? [], loading: query.loading, error: errorMessage(query.error), closeCohort };
}
