// React
import { useEffect, useState } from 'react';
// Local
import { getUpcomingCoffeeRoster } from '../../../domain/cafeSchedule';
import { getUpcomingCohortWithLessons } from '../../../domain/classesRoster';
import { firstLessonDate } from '../../../domain/cohortSchedule';
import { CommunityOverview, getCommunityOverview } from '../../../domain/communityGroups';
import { countIntegrationPeopleByStatus } from '../../../domain/integrationPeople';
import { listRecentMakeupNotes, MakeupNote } from '../../../domain/lessonMakeups';
import { countMembers } from '../../../domain/memberRecords';
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
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview()
      .then(setOverview)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return { overview, loading: !overview && !error, error };
}
