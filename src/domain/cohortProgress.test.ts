// Local
import { CohortBoard } from './classesRoster';
import { cohortsProgress } from './cohortProgress';

vi.mock('../lib/supabase', () => ({ supabase: {} }));

const lesson = (id: string, number: number, date: string) => ({ id, cohort_id: 'c1', number, date });

const board: CohortBoard = {
  cohorts: [
    {
      cohort: { id: 'c1', name: 'Turma 12', status: 'active' },
      lessons: [lesson('l1', 1, '2026-11-01'), lesson('l2', 2, '2026-11-05'), lesson('l3', 3, '2026-11-12')],
    },
  ],
  enrollments: [
    {
      id: 'e1',
      cohort_id: 'c1',
      person: { id: 'p1', name: 'Bruno', status: 'integration', membership_interest_sent_at: null },
    },
    {
      id: 'e2',
      cohort_id: 'c1',
      person: { id: 'p2', name: 'Ana', status: 'integration', membership_interest_sent_at: null },
    },
    {
      id: 'e3',
      cohort_id: 'c1',
      person: { id: 'p3', name: 'Caio', status: 'archived', membership_interest_sent_at: null },
    },
  ],
  attendance: [
    { id: 'a1', enrollment_id: 'e1', lesson_id: 'l1', attended: true },
    { id: 'a2', enrollment_id: 'e1', lesson_id: 'l2', attended: true },
    { id: 'a3', enrollment_id: 'e2', lesson_id: 'l1', attended: true },
    { id: 'a4', enrollment_id: 'e2', lesson_id: 'l2', attended: false },
  ],
};

describe('cohortsProgress', () => {
  it('summarizes each active class', () => {
    expect(cohortsProgress(board, '2026-11-07')).toEqual([
      { cohortId: 'c1', cohortName: 'Turma 12', nextLesson: { number: 3, date: '2026-11-12' }, enrolled: 3 },
    ]);
  });

  it('treats a lesson happening today as the next one', () => {
    expect(cohortsProgress(board, '2026-11-05')[0].nextLesson).toEqual({ number: 2, date: '2026-11-05' });
  });

  it('returns nothing when there is no open class', () => {
    expect(cohortsProgress({ cohorts: [], enrollments: [], attendance: [] }, '2026-11-07')).toEqual([]);
  });

  it('puts the most recent class on top', () => {
    const older = {
      cohort: { id: 'c0', name: 'Turma 11', status: 'active' as const },
      lessons: [lesson('x', 1, '2026-09-01')],
    };
    const names = cohortsProgress({ ...board, cohorts: [older, board.cohorts[0]] }, '2026-11-07').map(
      (p) => p.cohortName,
    );
    expect(names).toEqual(['Turma 12', 'Turma 11']);
  });
});
