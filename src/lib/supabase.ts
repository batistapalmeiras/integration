// Libs
import { createClient } from '@supabase/supabase-js';

// A token can be refused for being "issued at future"/"not yet valid" when
// the clock that signed it runs ahead of the clock that checks it — a few
// seconds of drift between the device, GoTrue and PostgREST is enough. It
// clears on its own, so one quiet retry beats painting an error screen over
// a working session.
const JWT_CLOCK_RETRY_DELAY_MS = 1500;
const SESSION_ERROR_MESSAGE = 'Não foi possível validar sua sessão agora. Tente novamente em alguns segundos.';

export function isJwtClockError(body: string): boolean {
  return /jwt/i.test(body) && /(issued at future|not yet valid|used before issued)/i.test(body);
}

// Every page reads `error.message` straight from supabase-js, so rewriting
// the body here is what keeps a raw English backend string from reaching a
// volunteer's screen — one place instead of every hook in the app.
const fetchWithJwtClockRetry: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (response.status !== 401 && response.status !== 403) return response;
  if (!isJwtClockError(await response.clone().text())) return response;

  await new Promise((resolve) => setTimeout(resolve, JWT_CLOCK_RETRY_DELAY_MS));
  const retry = await fetch(input, init);
  if (retry.ok || !isJwtClockError(await retry.clone().text())) return retry;

  return new Response(JSON.stringify({ message: SESSION_ERROR_MESSAGE }), {
    status: retry.status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { global: { fetch: fetchWithJwtClockRetry } },
);
