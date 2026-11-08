// Local
import { CohortProgress, cohortsProgress } from '../../../domain/classesRoster';
import { fetchCohortBoard } from '../../../repositories/classesRoster';
import { todayKey } from '../../../domain/dates';
import { MakeupNote } from '../../../domain/lessonMakeups';
import { listRecentMakeupNotes } from '../../../repositories/lessonMakeups';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';

const MAKEUP_NOTES_LIMIT = 3;

interface Overview {
  cohorts: CohortProgress[];
  makeupNotes: MakeupNote[];
}

async function loadOverview(): Promise<Overview> {
  const [board, makeupNotes] = await Promise.all([fetchCohortBoard(), listRecentMakeupNotes(MAKEUP_NOTES_LIMIT)]);
  return { cohorts: cohortsProgress(board, todayKey()), makeupNotes };
}

export function useTeacherDashboard() {
  const query = useQuery(queryKeys.teacherDashboard, loadOverview);
  return { overview: query.data ?? null, loading: query.loading, error: errorMessage(query.error) };
}
