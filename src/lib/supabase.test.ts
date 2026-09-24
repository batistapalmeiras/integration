// Local
import { isJwtClockError } from './supabase';

vi.stubGlobal('import.meta', { env: {} });

describe('isJwtClockError', () => {
  it('catches the message PostgREST returns when the token is ahead of its clock', () => {
    expect(isJwtClockError('{"message":"JWT issued at future"}')).toBe(true);
  });

  it('catches the not-yet-valid wording too', () => {
    expect(isJwtClockError('{"msg":"jwt not yet valid"}')).toBe(true);
  });

  it('leaves a genuinely expired session alone — that one needs a new login, not a retry', () => {
    expect(isJwtClockError('{"message":"JWT expired"}')).toBe(false);
  });

  it('ignores errors that have nothing to do with the token', () => {
    expect(isJwtClockError('{"message":"permission denied for table people"}')).toBe(false);
  });
});
