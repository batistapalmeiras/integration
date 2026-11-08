// Local
import { PersonStatus } from '../types/person';

export interface ActiveCohort {
  id: string;
  name: string;
  status: 'active' | 'closed';
}

export interface CohortLesson {
  id: string;
  cohort_id: string;
  number: number;
  date: string;
}

export interface CohortWithLessons {
  cohort: ActiveCohort;
  lessons: CohortLesson[];
}

export interface PersonIntegrationClass extends CohortWithLessons {
  enrollmentId: string;
  attendanceByLesson: Record<string, { id: string; attended: boolean }>;
}

export interface EnrollablePerson {
  id: string;
  name: string;
  status: PersonStatus;
}

export interface CohortBoardEnrollment {
  id: string;
  cohort_id: string;
  person: { id: string; name: string; status: string; membership_interest_sent_at: string | null };
}

export interface CohortBoardAttendance {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  attended: boolean;
}

export interface CohortBoard {
  cohorts: CohortWithLessons[];
  enrollments: CohortBoardEnrollment[];
  attendance: CohortBoardAttendance[];
}

export interface LessonRef {
  number: number;
  date: string;
}

export interface CohortProgress {
  cohortId: string;
  cohortName: string;
  nextLesson: LessonRef | null;
  enrolled: number;
}

const firstDate = (cohort: CohortWithLessons) =>
  cohort.lessons.reduce((first, lesson) => (lesson.date < first ? lesson.date : first), cohort.lessons[0]?.date ?? '');

export function cohortsProgress(board: CohortBoard, today: string): CohortProgress[] {
  return [...board.cohorts]
    .sort((a, b) => firstDate(b).localeCompare(firstDate(a)))
    .map((cohort) => {
      const nextLesson = [...cohort.lessons].sort((a, b) => a.date.localeCompare(b.date)).find((l) => l.date >= today);
      return {
        cohortId: cohort.cohort.id,
        cohortName: cohort.cohort.name,
        nextLesson: nextLesson ? { number: nextLesson.number, date: nextLesson.date } : null,
        enrolled: board.enrollments.filter((enrollment) => enrollment.cohort_id === cohort.cohort.id).length,
      };
    });
}
