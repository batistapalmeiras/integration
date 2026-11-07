// Local
import { isCompletePhone, isSamePhone } from './phone';

describe('phone rules', () => {
  it('accepts landlines and mobiles with area code, whatever the formatting', () => {
    expect(isCompletePhone('(31) 3333-4444')).toBe(true);
    expect(isCompletePhone('31 99999-8888')).toBe(true);
    expect(isCompletePhone('99999-8888')).toBe(false);
  });

  it('compares numbers by their digits only', () => {
    expect(isSamePhone('(31) 99999-8888', '31999998888')).toBe(true);
    expect(isSamePhone('(31) 99999-8888', '(31) 3333-4444')).toBe(false);
    expect(isSamePhone('', '')).toBe(false);
  });
});
