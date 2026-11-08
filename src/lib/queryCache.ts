// React
import { useCallback, useEffect, useSyncExternalStore } from 'react';
// Local
import { PIPELINE_ROOTS, queryKeys } from './queryKeys';
import { useLatest } from './useLatest';

type QueryKey = readonly unknown[];

interface Entry {
  key: QueryKey;
  data: unknown;
  error: unknown;
  updatedAt: number;
  stale: boolean;
  promise: Promise<unknown> | null;
  fetcher: (() => Promise<unknown>) | null;
  version: number;
  listeners: Set<() => void>;
}

const DEFAULT_STALE_TIME = 30_000;
const entries = new Map<string, Entry>();

const hashKey = (key: QueryKey) => JSON.stringify(key);

function getEntry(key: QueryKey): Entry {
  const hash = hashKey(key);
  let entry = entries.get(hash);
  if (!entry) {
    entry = {
      key,
      data: undefined,
      error: null,
      updatedAt: 0,
      stale: true,
      promise: null,
      fetcher: null,
      version: 0,
      listeners: new Set(),
    };
    entries.set(hash, entry);
  }
  return entry;
}

function notify(entry: Entry) {
  entry.version += 1;
  entry.listeners.forEach((listener) => listener());
}

export function fetchQuery<T>(key: QueryKey, fetcher: () => Promise<T>): Promise<T> {
  const entry = getEntry(key);
  entry.fetcher = fetcher;
  if (entry.promise) return entry.promise as Promise<T>;

  const promise = fetcher()
    .then(
      (data) => {
        entry.data = data;
        entry.error = null;
        entry.updatedAt = Date.now();
        entry.stale = false;
        return data;
      },
      (error) => {
        entry.error = error;
        throw error;
      },
    )
    .finally(() => {
      entry.promise = null;
      notify(entry);
    });

  entry.promise = promise;
  notify(entry);
  return promise;
}

export function setQueryData<T>(key: QueryKey, updater: T | ((current: T | undefined) => T)) {
  const entry = getEntry(key);
  entry.data =
    typeof updater === 'function' ? (updater as (current: T | undefined) => T)(entry.data as T | undefined) : updater;
  entry.error = null;
  entry.updatedAt = Date.now();
  entry.stale = false;
  notify(entry);
}

const startsWith = (key: QueryKey, prefix: QueryKey) =>
  prefix.every((part, index) => hashKey([part]) === hashKey([key[index]]));

export function invalidateQueries(
  match: QueryKey | ((key: QueryKey) => boolean),
  { refetchActive = true }: { refetchActive?: boolean } = {},
): Promise<void> {
  const matches = typeof match === 'function' ? match : (key: QueryKey) => startsWith(key, match);
  const refetches: Promise<unknown>[] = [];
  entries.forEach((entry) => {
    if (!matches(entry.key)) return;
    entry.stale = true;
    if (refetchActive && entry.listeners.size > 0 && entry.fetcher) {
      refetches.push(fetchQuery(entry.key, entry.fetcher).catch(() => undefined));
    }
  });
  return Promise.all(refetches).then(() => undefined);
}

export function clearQueries() {
  entries.clear();
}

export function markPipelineStale(): Promise<void> {
  return invalidateQueries((key) => PIPELINE_ROOTS.includes(key[0] as (typeof PIPELINE_ROOTS)[number]), {
    refetchActive: false,
  });
}

export function refreshMembershipPendingCount(): Promise<void> {
  return invalidateQueries(queryKeys.membershipPendingCount);
}

export function errorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message : String(error);
}

interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useQuery<T>(
  key: QueryKey,
  fetcher: () => Promise<T>,
  { enabled = true, staleTime = DEFAULT_STALE_TIME }: QueryOptions = {},
) {
  const hash = hashKey(key);
  const entry = getEntry(key);
  const fetcherRef = useLatest(fetcher);

  const subscribe = useCallback(
    (listener: () => void) => {
      entry.listeners.add(listener);
      return () => {
        entry.listeners.delete(listener);
      };
    },
    [entry],
  );
  useSyncExternalStore(subscribe, () => entry.version);

  useEffect(() => {
    if (!enabled) return;
    const fresh = entry.data !== undefined && !entry.stale && Date.now() - entry.updatedAt < staleTime;
    if (!fresh) fetchQuery(entry.key, () => fetcherRef.current()).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, enabled]);

  const refetch = useCallback(
    () => fetchQuery(entry.key, () => fetcherRef.current()) as Promise<T>,
    [entry, fetcherRef],
  );

  return {
    data: entry.data as T | undefined,
    error: entry.error,
    loading: enabled && entry.data === undefined && !entry.error,
    fetching: !!entry.promise,
    refetch,
  };
}
