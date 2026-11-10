// Local
import { canLeavePhoneEmpty } from '../../src/domain/memberRecords';

describe('canLeavePhoneEmpty', () => {
  it('lets only people from the membership signup go without a phone', () => {
    expect(canLeavePhoneEmpty('membership_signup')).toBe(true);
    expect(canLeavePhoneEmpty('integration')).toBe(false);
    expect(canLeavePhoneEmpty('imported')).toBe(false);
    expect(canLeavePhoneEmpty(undefined)).toBe(false);
  });
});
