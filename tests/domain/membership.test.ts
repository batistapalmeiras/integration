// Local
import { communityDeclines, hasCompletedLessons } from '../../src/domain/membership';

describe('hasCompletedLessons', () => {
  it('needs every lesson of the cohort, makeups included', () => {
    expect(hasCompletedLessons(4, 4)).toBe(true);
    expect(hasCompletedLessons(3, 4)).toBe(false);
  });

  it('is never true for a cohort without lessons', () => {
    expect(hasCompletedLessons(0, 0)).toBe(false);
  });
});

describe('communityDeclines', () => {
  it('notes when the person said not now to a small group', () => {
    expect(communityDeclines({ wants_small_group: 'not_now', ministry_interests: ['Louvor'] })).toEqual({
      smallGroup: true,
      ministry: false,
    });
  });

  it('notes when the person said they cannot serve now', () => {
    expect(communityDeclines({ wants_small_group: 'yes', ministry_interests: [] })).toEqual({
      smallGroup: false,
      ministry: true,
    });
  });

  it('notes nothing for someone already in a small group', () => {
    expect(communityDeclines({ wants_small_group: 'already', ministry_interests: ['60+'] }).smallGroup).toBe(false);
  });

  it('notes nothing when there is no form to go by', () => {
    expect(communityDeclines(null)).toEqual({ smallGroup: false, ministry: false });
    expect(communityDeclines({ wants_small_group: null, ministry_interests: null })).toEqual({
      smallGroup: false,
      ministry: false,
    });
  });
});
