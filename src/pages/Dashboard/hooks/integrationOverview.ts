// Local
import { getUpcomingCoffeeRoster } from '../../../repositories/cafeSchedule';
import { listOpenCohorts } from '../../../repositories/classesRoster';
import { firstLessonDate, selectUpcomingCohort, UpcomingLesson, upcomingLessons } from '../../../domain/cohortSchedule';
import { todayKey } from '../../../domain/dates';
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
  lessons: UpcomingLesson[];
  makeupNotes: MakeupNote[];
}

export async function loadIntegrationOverview(): Promise<IntegrationOverview> {
  const [funnel, membershipPending, coffee, openCohorts, makeupNotes] = await Promise.all([
    countIntegrationPeopleByStatus(),
    countMembershipPending(),
    getUpcomingCoffeeRoster(),
    listOpenCohorts(),
    listRecentMakeupNotes(MAKEUP_NOTES_LIMIT),
  ]);
  const cohort = selectUpcomingCohort(openCohorts);
  const firstLesson = cohort ? firstLessonDate(cohort.lessons) : null;
  return {
    funnel: { ...funnel, membership_pending: membershipPending },
    coffee,
    cohort: cohort && firstLesson ? { name: cohort.cohort.name, firstLesson } : null,
    lessons: upcomingLessons(openCohorts, todayKey()),
    makeupNotes,
  };
}
