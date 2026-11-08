// Local
import {
  currentLesson,
  hasFirstLessonStarted,
  selectUpcomingCohort,
} from '../../src/domain/cohortSchedule';

const lessons = (first: string, id = first) => ({
  id,
  lessons: [1, 2, 3, 4].map((number) => ({ number, date: first })),
});

const running = lessons('2026-09-20');
const next = lessons('2026-11-08');

describe('hasFirstLessonStarted', () => {
  it('holds the turma open until 17:30 of the first class', () => {
    expect(hasFirstLessonStarted('2026-09-20', new Date('2026-09-20T17:29:00'))).toBe(false);
    expect(hasFirstLessonStarted('2026-09-20', new Date('2026-09-20T17:30:00'))).toBe(true);
  });
});

describe('selectUpcomingCohort', () => {
  it('skips the turma already under way and picks the next one', () => {
    expect(selectUpcomingCohort([running, next], new Date('2026-10-04T19:00:00'))?.id).toBe('2026-11-08');
  });

  it('returns nothing when no turma is scheduled ahead', () => {
    expect(selectUpcomingCohort([running], new Date('2026-10-04T19:00:00'))).toBeNull();
  });

  it('picks the earliest of several upcoming turmas', () => {
    expect(selectUpcomingCohort([next, lessons('2026-10-18')], new Date('2026-10-04T19:00:00'))?.id).toBe('2026-10-18');
  });
});

describe('currentLesson', () => {
  const dates = [
    { number: 3, date: '2026-10-04' },
    { number: 1, date: '2026-09-20' },
    { number: 4, date: '2026-10-11' },
    { number: 2, date: '2026-09-27' },
  ];

  it('picks the first class before the turma starts', () => {
    expect(currentLesson(dates, '2026-09-19')?.number).toBe(1);
  });

  it('picks the class of the day', () => {
    expect(currentLesson(dates, '2026-09-27')?.number).toBe(2);
  });

  it('picks the latest class already held between classes', () => {
    expect(currentLesson(dates, '2026-10-08')?.number).toBe(3);
  });

  it('stays on the last class after the turma ends', () => {
    expect(currentLesson(dates, '2026-10-31')?.number).toBe(4);
  });
});
