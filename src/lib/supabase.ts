// Libs
import { createClient } from '@supabase/supabase-js';
// Local
import { markPipelineStale } from './queryCache';
import { Database } from './database.types';

const JWT_CLOCK_RETRY_DELAY_MS = 1500;
const AUTH_PATH = '/auth/v1/';
const SESSION_ERROR_MESSAGE = 'Não foi possível validar sua sessão agora. Tente novamente em alguns segundos.';

const UNIQUE_VIOLATION = '23505';
const DUPLICATE_MESSAGES: Record<string, string> = {
  people_phone_key: 'Esse telefone já está no cadastro de outra pessoa.',
  member_profiles_cpf_key: 'Esse CPF já está no cadastro de outra pessoa.',
};

export function duplicateMessage(body: string): string | null {
  try {
    const error: unknown = JSON.parse(body);
    if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== UNIQUE_VIOLATION) return null;
    const text = 'message' in error && typeof error.message === 'string' ? error.message : '';
    const constraint = Object.keys(DUPLICATE_MESSAGES).find((name) => text.includes(name));
    return constraint ? DUPLICATE_MESSAGES[constraint] : null;
  } catch {
    return null;
  }
}

export function isJwtClockError(body: string): boolean {
  return /jwt/i.test(body) && /(issued at future|not yet valid|used before issued)/i.test(body);
}

export function isJwtExpiredError(body: string): boolean {
  return /jwt expired/i.test(body);
}

type FetchInput = Parameters<typeof fetch>[0];

function requestUrl(input: FetchInput): string {
  return typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
}

function bearerToken(init?: RequestInit): string | null {
  const authorization = new Headers(init?.headers).get('Authorization');
  return authorization?.replace(/^Bearer\s+/i, '') ?? null;
}

async function freshAccessToken(rejectedToken: string | null): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const current = data.session?.access_token ?? null;
  if (current && current !== rejectedToken) return current;

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  return error ? null : (refreshed.session?.access_token ?? null);
}

async function retryWithFreshSession(
  input: FetchInput,
  init: RequestInit | undefined,
  rejected: Response,
): Promise<Response> {
  const token = await freshAccessToken(bearerToken(init));
  if (!token) return rejected;

  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

async function retryAfterClockDrift(input: FetchInput, init: RequestInit | undefined): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, JWT_CLOCK_RETRY_DELAY_MS));
  const retry = await fetch(input, init);
  if (retry.ok || !isJwtClockError(await retry.clone().text())) return retry;

  return new Response(JSON.stringify({ message: SESSION_ERROR_MESSAGE }), {
    status: retry.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const fetchWithJwtRetry: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (response.status !== 401 && response.status !== 403) return response;
  if (requestUrl(input).includes(AUTH_PATH)) return response;

  const body = await response.clone().text();
  if (isJwtExpiredError(body)) return retryWithFreshSession(input, init, response);
  if (isJwtClockError(body)) return retryAfterClockDrift(input, init);
  return response;
};

const READ_METHODS = ['GET', 'HEAD'];

function isDataWrite(input: FetchInput, init?: RequestInit): boolean {
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
  return !READ_METHODS.includes(method) && !requestUrl(input).includes(AUTH_PATH);
}

const fetchAndTrackWrites: typeof fetch = async (input, init) => {
  const response = await fetchWithJwtRetry(input, init);
  if (response.ok && isDataWrite(input, init)) markPipelineStale();
  if (response.ok) return response;
  const body = await response.clone().text();
  const message = duplicateMessage(body);
  if (!message) return response;
  return new Response(JSON.stringify({ ...JSON.parse(body), message }), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { global: { fetch: fetchAndTrackWrites } },
);
