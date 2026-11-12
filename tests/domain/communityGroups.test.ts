// Local
import { percentOf } from '../../src/domain/communityGroups';

describe('percentOf', () => {
  it('rounds to a whole percent', () => {
    expect(percentOf(113, 233)).toBe(48);
    expect(percentOf(53, 233)).toBe(23);
  });

  it('is zero when there are no members to compare with', () => {
    expect(percentOf(5, 0)).toBe(0);
  });
});
