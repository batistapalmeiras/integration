// Local
import { hasCompletedLessons } from './membershipEligibility';

describe('hasCompletedLessons', () => {
  it('needs every lesson of the cohort, makeups included', () => {
    expect(hasCompletedLessons(4, 4)).toBe(true);
    expect(hasCompletedLessons(3, 4)).toBe(false);
  });

  it('is never true for a cohort without lessons', () => {
    expect(hasCompletedLessons(0, 0)).toBe(false);
  });
});
