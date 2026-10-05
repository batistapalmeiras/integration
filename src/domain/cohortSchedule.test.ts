// Local
import {
  hasFirstLessonStarted,
  isCohortFinished,
  selectCohortForCoffee,
  selectMissedSignups,
  selectUpcomingCohort,
} from './cohortSchedule';

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

describe('selectCohortForCoffee', () => {
  it('matches a café to the first turma starting after it', () => {
    expect(selectCohortForCoffee([running, next], '2026-10-04', new Date('2026-10-04T19:00:00'))?.id).toBe('2026-11-08');
  });

  it('matches an older café to the turma that was open back then', () => {
    expect(selectCohortForCoffee([running, next], '2026-09-13', new Date('2026-10-04T19:00:00'))?.id).toBe('2026-09-20');
  });
});

describe('selectMissedSignups', () => {
  const now = new Date('2026-10-04T19:00:00');

  it('archives whoever let the turma open to them start without signing up', () => {
    expect(selectMissedSignups([{ personId: 'a', coffeeDate: '2026-09-13' }], [running, next], now)).toEqual(['a']);
  });

  it('spares someone whose turma has not started yet', () => {
    expect(selectMissedSignups([{ personId: 'a', coffeeDate: '2026-10-04' }], [running, next], now)).toEqual([]);
  });

  it('spares someone with no turma scheduled after their café — there was nothing to miss', () => {
    expect(selectMissedSignups([{ personId: 'a', coffeeDate: '2026-10-04' }], [running], now)).toEqual([]);
  });

  it('spares a person with no café date while a turma is still upcoming', () => {
    expect(selectMissedSignups([{ personId: 'a', coffeeDate: null }], [running, next], now)).toEqual([]);
  });
});

describe('isCohortFinished', () => {
  const fourWeeks = [
    { number: 1, date: '2026-09-20' },
    { number: 2, date: '2026-09-27' },
    { number: 3, date: '2026-10-04' },
    { number: 4, date: '2026-10-11' },
  ];

  it('closes once the last class is past and nobody is still going through it', () => {
    expect(isCohortFinished(fourWeeks, 0, '2026-10-12')).toBe(true);
  });

  it('keeps it open while someone is still in integração', () => {
    expect(isCohortFinished(fourWeeks, 1, '2026-10-12')).toBe(false);
  });

  it('keeps it open while classes are still to come, even with an empty roster', () => {
    expect(isCohortFinished(fourWeeks, 0, '2026-10-05')).toBe(false);
  });
});
