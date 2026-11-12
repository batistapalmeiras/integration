// Local
import { currentCouncil } from '../../src/domain/councils';

const council = (id: string, meetingDate: string) => ({ id, meetingDate, memberCount: 0 });

describe('currentCouncil', () => {
  it('is the council with the latest meeting date, whatever the order', () => {
    const councils = [council('a', '2026-08-04'), council('b', '2026-11-10'), council('c', '2026-09-15')];
    expect(currentCouncil(councils)?.id).toBe('b');
  });

  it('is empty before the first council', () => {
    expect(currentCouncil([])).toBeNull();
  });
});
