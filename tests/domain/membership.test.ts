// Local
import { communityRequirements, hasCompletedLessons } from '../../src/domain/membership';

describe('hasCompletedLessons', () => {
  it('needs every lesson of the cohort, makeups included', () => {
    expect(hasCompletedLessons(4, 4)).toBe(true);
    expect(hasCompletedLessons(3, 4)).toBe(false);
  });

  it('is never true for a cohort without lessons', () => {
    expect(hasCompletedLessons(0, 0)).toBe(false);
  });
});

describe('communityRequirements', () => {
  it('drops the small group when the person said not now', () => {
    expect(communityRequirements({ wants_small_group: 'not_now', ministry_interests: ['Louvor'] })).toEqual({
      smallGroupRequired: false,
      ministryRequired: true,
    });
  });

  it('drops the ministry when the person said they cannot serve now', () => {
    expect(communityRequirements({ wants_small_group: 'yes', ministry_interests: [] })).toEqual({
      smallGroupRequired: true,
      ministryRequired: false,
    });
  });

  it('keeps the small group for someone already in one', () => {
    expect(communityRequirements({ wants_small_group: 'already', ministry_interests: ['60+'] }).smallGroupRequired).toBe(
      true,
    );
  });

  it('requires both when there is no form to go by', () => {
    expect(communityRequirements(null)).toEqual({ smallGroupRequired: true, ministryRequired: true });
    expect(communityRequirements({ wants_small_group: null, ministry_interests: null })).toEqual({
      smallGroupRequired: true,
      ministryRequired: true,
    });
  });
});
