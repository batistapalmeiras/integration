// Local
import { parseTypedDate } from './dates';

describe('parseTypedDate', () => {
  it('turns a typed dd/mm/aaaa date into a date key', () => {
    expect(parseTypedDate('07/03/1990')).toBe('1990-03-07');
  });

  it('rejects incomplete and impossible dates', () => {
    expect(parseTypedDate('07/03/19')).toBeNull();
    expect(parseTypedDate('31/02/1990')).toBeNull();
    expect(parseTypedDate('00/13/1990')).toBeNull();
  });
});
