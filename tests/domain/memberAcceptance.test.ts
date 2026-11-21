// Local
import { isRecentlyAccepted } from '../../src/domain/memberAcceptance';

describe('recently accepted members', () => {
  it('counts the councils of the last three months, today included', () => {
    expect(isRecentlyAccepted('2026-08-20', '2026-11-20')).toBe(true);
    expect(isRecentlyAccepted('2026-11-20', '2026-11-20')).toBe(true);
    expect(isRecentlyAccepted('2026-08-19', '2026-11-20')).toBe(false);
  });

  it('leaves out who was never accepted in a council and future councils', () => {
    expect(isRecentlyAccepted(null, '2026-11-20')).toBe(false);
    expect(isRecentlyAccepted('2026-11-21', '2026-11-20')).toBe(false);
  });
});
