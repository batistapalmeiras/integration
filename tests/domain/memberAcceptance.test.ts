// Local
import { acceptedOn, isRecentlyAccepted } from '../../src/domain/memberAcceptance';

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

describe('acceptance date of a member', () => {
  const base = { origin: 'visitor', entryType: 'transfer_letter' as const, councilDate: '2026-11-10', createdAt: '2026-11-15T12:00:00Z' };

  it('is the council date of who came through the integration', () => {
    expect(acceptedOn(base)).toBe('2026-11-10');
    expect(acceptedOn({ ...base, councilDate: null })).toBeNull();
  });

  it('leaves out who signed up directly, unless they came by baptism', () => {
    expect(acceptedOn({ ...base, origin: 'membership_signup' })).toBeNull();
    expect(acceptedOn({ ...base, origin: 'membership_signup', entryType: 'acclamation' })).toBeNull();
    expect(acceptedOn({ ...base, origin: 'membership_signup', entryType: null })).toBeNull();
  });

  it('counts who signed up directly by baptism, on the council date or else on the signup day', () => {
    const baptism = { ...base, origin: 'membership_signup', entryType: 'baptism' as const };

    expect(acceptedOn(baptism)).toBe('2026-11-10');
    expect(acceptedOn({ ...baptism, councilDate: null })).toBe('2026-11-15');
  });
});
