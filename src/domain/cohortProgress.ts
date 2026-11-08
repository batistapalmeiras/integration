// Local
import { CohortBoard, CohortWithLessons } from './classesRoster';

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
