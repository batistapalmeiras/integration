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

  it('keeps at least the minimum number of rows when the columns are many', () => {
    expect(fullRowsPageSize(8, 15, 3)).toBe(24);
    expect(fullRowsPageSize(7, 15, 3)).toBe(21);
    expect(fullRowsPageSize(4, 15, 3)).toBe(16);
    expect(fullRowsPageSize(5, 15, 3)).toBe(15);
  });
});
