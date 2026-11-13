// Local
import { sameItems } from '../../src/lib/sameItems';

describe('sameItems', () => {
  it('ignores the order', () => {
    expect(sameItems(['a', 'b'], ['b', 'a'])).toBe(true);
  });

  it('tells when something was added, removed or swapped', () => {
    expect(sameItems(['a'], ['a', 'b'])).toBe(false);
    expect(sameItems(['a', 'b'], ['a'])).toBe(false);
    expect(sameItems(['a', 'b'], ['a', 'c'])).toBe(false);
  });
});
