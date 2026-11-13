// Local
import { getUpcomingCoffeeRoster } from '../../../repositories/cafeSchedule';
import { getUpcomingCohortWithLessons } from '../../../repositories/classesRoster';
import { firstLessonDate } from '../../../domain/cohortSchedule';
import { countIntegrationPeopleByStatus } from '../../../repositories/integrationPeople';
import { countMembershipPending } from '../../../repositories/membership';
import { MakeupNote } from '../../../domain/lessonMakeups';
import { listRecentMakeupNotes } from '../../../repositories/lessonMakeups';
import { UpcomingCoffee, UpcomingCohort } from '../components/AgendaPanel';
import { FunnelCounts } from '../components/FunnelSection';

const MAKEUP_NOTES_LIMIT = 3;

export interface IntegrationOverview {
  funnel: FunnelCounts;
  coffee: UpcomingCoffee | null;
  cohort: UpcomingCohort | null;
  makeupNotes: MakeupNote[];
}

export async function loadIntegrationOverview(): Promise<IntegrationOverview> {
  const [funnel, membershipPending, coffee, cohort, makeupNotes] = await Promise.all([
    countIntegrationPeopleByStatus(),
    countMembershipPending(),
    getUpcomingCoffeeRoster(),
    getUpcomingCohortWithLessons(),
    listRecentMakeupNotes(MAKEUP_NOTES_LIMIT),
  ]);
  const firstLesson = cohort ? firstLessonDate(cohort.lessons) : null;
  return {
    funnel: { ...funnel, membership_pending: membershipPending },
    coffee,
    cohort: cohort && firstLesson ? { name: cohort.cohort.name, firstLesson } : null,
    makeupNotes,
  };
}
