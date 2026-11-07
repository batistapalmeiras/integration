// Local
import { getUpcomingCoffeeRoster } from '../../../domain/cafeSchedule';
import { getUpcomingCohortWithLessons } from '../../../domain/classesRoster';
import { firstLessonDate } from '../../../domain/cohortSchedule';
import { CommunityOverview, getCommunityOverview } from '../../../domain/communityGroups';
import { countIntegrationPeopleByStatus } from '../../../domain/integrationPeople';
import { listRecentMakeupNotes, MakeupNote } from '../../../domain/lessonMakeups';
import { countMembers } from '../../../domain/memberRecords';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { PersonStatus } from '../../../types/person';

const MAKEUP_NOTES_LIMIT = 3;

interface Overview {
  funnel: Partial<Record<PersonStatus, number>>;
  totalMembers: number;
  community: CommunityOverview;
  coffee: { eventDate: string; rosterCount: number } | null;
  cohort: { name: string; firstLesson: string } | null;
  makeupNotes: MakeupNote[];
}

async function loadOverview(): Promise<Overview> {
  const [funnel, totalMembers, community, coffee, cohort, makeupNotes] = await Promise.all([
    countIntegrationPeopleByStatus(),
    countMembers(),
    getCommunityOverview(),
    getUpcomingCoffeeRoster(),
    getUpcomingCohortWithLessons(),
    listRecentMakeupNotes(MAKEUP_NOTES_LIMIT),
  ]);
  const firstLesson = cohort ? firstLessonDate(cohort.lessons) : null;
  return {
    funnel,
    totalMembers,
    community,
    coffee,
    cohort: cohort && firstLesson ? { name: cohort.cohort.name, firstLesson } : null,
    makeupNotes,
  };
}

export function usePastorDashboard() {
  const query = useQuery(queryKeys.pastorDashboard, loadOverview);
  return { overview: query.data ?? null, loading: query.loading, error: errorMessage(query.error) };
}
