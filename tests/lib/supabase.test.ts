// Local
import { isJwtClockError, isJwtExpiredError, supabase } from '../../src/lib/supabase';

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

describe('isJwtExpiredError', () => {
  it('catches the message PostgREST returns for an expired token', () => {
    expect(isJwtExpiredError('{"code":"PGRST301","message":"JWT expired"}')).toBe(true);
  });

  it('does not confuse clock drift with expiry', () => {
    expect(isJwtExpiredError('{"message":"JWT issued at future"}')).toBe(false);
  });
});

describe('expired session on resume', () => {
  const jsonResponse = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const session = (token: string) => ({ data: { session: { access_token: token } }, error: null }) as never;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renews the session once and repeats the request with the new token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ code: 'PGRST301', message: 'JWT expired' }, 401))
      .mockResolvedValueOnce(jsonResponse([{ id: '1' }], 200));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue(session('expired'));
    const refresh = vi.spyOn(supabase.auth, 'refreshSession').mockResolvedValue(session('fresh'));

    const { data, error } = await supabase.from('people').select('id');

    expect(error).toBeNull();
    expect(data).toEqual([{ id: '1' }]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(new Headers(fetchMock.mock.calls[1][1].headers).get('Authorization')).toBe('Bearer fresh');
  });

  it('reuses a token another request already renewed instead of renewing again', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'JWT expired' }, 401))
      .mockResolvedValueOnce(jsonResponse([], 200));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(supabase.auth, 'getSession')
      .mockResolvedValueOnce(session('expired'))
      .mockResolvedValueOnce(session('renewed-elsewhere'));
    const refresh = vi.spyOn(supabase.auth, 'refreshSession');

    await supabase.from('people').select('id');

    expect(refresh).not.toHaveBeenCalled();
    expect(new Headers(fetchMock.mock.calls[1][1].headers).get('Authorization')).toBe('Bearer renewed-elsewhere');
  });
});
