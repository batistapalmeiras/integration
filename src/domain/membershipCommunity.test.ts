// Local
import { communityRequirements } from './membershipCommunity';

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
