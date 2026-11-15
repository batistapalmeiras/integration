// Local
import { fullRowsPageSize } from '../../src/lib/useGridColumns';

describe('fullRowsPageSize', () => {
  it('rounds the page up to whole rows', () => {
    expect(fullRowsPageSize(5, 15)).toBe(15);
    expect(fullRowsPageSize(3, 15)).toBe(15);
    expect(fullRowsPageSize(2, 15)).toBe(16);
    expect(fullRowsPageSize(4, 15)).toBe(16);
    expect(fullRowsPageSize(6, 15)).toBe(18);
  });
});
